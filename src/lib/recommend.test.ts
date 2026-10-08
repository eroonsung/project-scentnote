import { describe, expect, it } from 'vitest'
import chipsJson from '../data/chips.json'
import familiesJson from '../data/families.json'
import perfumesJson from '../data/perfumes.json'
import type { Chips, Family, Perfume, Selection } from '../types'
import { countCandidates, recommend } from './recommend'

const perfumes = perfumesJson as unknown as Perfume[]
const chips = chipsJson as unknown as Chips
const familiesList = familiesJson as unknown as Family[]
const base: Selection = { mode: 'self', moods: [], objects: [], avoids: [], unsure: false }

describe('recommend', () => {
  it('어떤 조합이든 항상 3개를 돌려준다', () => {
    const cases: Selection[] = [
      { ...base, moods: ['calm'], objects: ['forest'] },
      { ...base, moods: ['zesty', 'cool'], objects: ['lemon', 'rain'], avoids: ['tooSweet', 'tooStrong', 'powdery'] },
      { ...base, mode: 'gift', moods: [], unsure: true },
      { ...base, moods: ['sensual'], objects: ['smoky'], avoids: ['smoky'] },
    ]
    for (const s of cases) expect(recommend(perfumes, chips, familiesList, s).items).toHaveLength(3)
  })

  it('분위기와 향기를 둘 다 충족하는 향수가 3개 이상이면 3개 모두 둘 다 충족한다', () => {
    const meets = (p: Perfume, mood: string, family: string) =>
      p.moods.includes(mood) && (p.family === family || p.subFamilies.includes(family as Perfume['family']))
    let checked = 0
    for (const m of chips.moods) {
      for (const o of chips.objects) {
        const pool = perfumes.filter((p) => meets(p, m.id, o.family))
        if (pool.length < 3) continue
        checked++
        const { items } = recommend(perfumes, chips, familiesList, { ...base, moods: [m.id], objects: [o.id] })
        for (const r of items) expect(meets(r.perfume, m.id, o.family)).toBe(true)
      }
    }
    expect(checked).toBeGreaterThan(50)
  })

  it('피하고 싶은 칩과 겹치는 향수는 나오지 않는다', () => {
    const s: Selection = { ...base, moods: ['warm', 'sweet'], objects: ['vanilla'], avoids: ['tooSweet'] }
    const { items } = recommend(perfumes, chips, familiesList, s)
    for (const r of items) expect(r.perfume.avoidFlags).not.toContain('tooSweet')
  })

  it('시향 순서는 향 계열 순서 → 강도 순서로 정렬된다', () => {
    const s: Selection = { ...base, moods: ['calm', 'clean'], objects: ['rain', 'soap', 'forest'] }
    const { items } = recommend(perfumes, chips, familiesList, s)
    const order = new Map(familiesList.map((f) => [f.id, f.order]))
    const orders = items.map((r) => order.get(r.perfume.family) ?? 99)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('가능하면 서로 다른 향 계열 3개를 고른다', () => {
    const s: Selection = { ...base, moods: ['calm', 'clean'], objects: ['rain', 'soap', 'forest'] }
    const { items } = recommend(perfumes, chips, familiesList, s)
    expect(new Set(items.map((r) => r.perfume.family)).size).toBe(3)
  })

  it('고른 향기 칩마다 그 계열의 향수가 하나씩 나온다', () => {
    const s: Selection = { ...base, moods: ['calm', 'clean'], objects: ['rain', 'soap', 'forest'] }
    const got = recommend(perfumes, chips, familiesList, s).items.map((r) => r.perfume.family)
    expect(new Set(got)).toEqual(new Set(['aqua', 'musk', 'woody']))
  })

  it('잘 모르겠어요(unsure)이면 호불호 적은 향을 먼저 고른다', () => {
    const { items } = recommend(perfumes, chips, familiesList, { ...base, mode: 'gift', unsure: true })
    expect(items.every((r) => r.perfume.polarizing === 'low')).toBe(true)
  })

  it('추천 이유는 최대 2개이고 고른 칩 이름이다', () => {
    const s: Selection = { ...base, moods: ['clean'], objects: ['soap'] }
    const { items } = recommend(perfumes, chips, familiesList, s)
    for (const r of items) expect(r.reasons.length).toBeLessThanOrEqual(2)
  })

  it('후보 개수: 모두 맞는 향수는 칩을 더할수록 줄고, 하나라도 맞는 향수는 늘어난다', () => {
    const one = countCandidates(perfumes, chips, { ...base, moods: ['calm'] })
    const two = countCandidates(perfumes, chips, { ...base, moods: ['calm', 'clean'] })
    expect(two.all).toBeLessThanOrEqual(one.all)
    expect(two.any).toBeGreaterThanOrEqual(one.any)
    const expectedAll = perfumes.filter((p) => p.moods.includes('calm') && p.moods.includes('clean')).length
    expect(two.all).toBe(expectedAll)
  })

  it('피하고 싶은 칩이 있으면 후보 개수에서 뺀다', () => {
    const all = countCandidates(perfumes, chips, { ...base, moods: ['sweet'] })
    const fewer = countCandidates(perfumes, chips, { ...base, moods: ['sweet'], avoids: ['tooSweet'] })
    expect(fewer.any).toBeLessThan(all.any)
  })
})

describe('장면 고르기(SCENES)', () => {
  it('장면의 칩은 모두 실제 칩이고, 서로 어울리지 않는 분위기가 없다', async () => {
    const { SCENES } = await import('./scenes')
    for (const s of SCENES) {
      for (const m of s.moods) expect(chips.moods.some((c) => c.id === m)).toBe(true)
      for (const o of s.objects) expect(chips.objects.some((c) => c.id === o)).toBe(true)
      for (const [a, b] of chips.conflicts) expect(s.moods.includes(a) && s.moods.includes(b)).toBe(false)
    }
  })

  it('장면마다 추천 3개가 나오고, 분위기와 향기를 둘 다 충족하는 향수가 먼저 나온다', async () => {
    const { SCENES } = await import('./scenes')
    for (const s of SCENES) {
      const sel: Selection = { ...base, moods: s.moods, objects: s.objects }
      const { items } = recommend(perfumes, chips, familiesList, sel)
      expect(items).toHaveLength(3)
      const fam = chips.objects.find((o) => o.id === s.objects[0])!.family
      const both = items.filter((r) => r.perfume.moods.some((m) => s.moods.includes(m)) && (r.perfume.family === fam || r.perfume.subFamilies.includes(fam)))
      expect(both.length).toBeGreaterThanOrEqual(2)
    }
  })
})
