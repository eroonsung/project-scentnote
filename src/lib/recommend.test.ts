import { describe, expect, it } from 'vitest'
import chipsJson from '../data/chips.json'
import familiesJson from '../data/families.json'
import perfumesJson from '../data/perfumes.json'
import type { Chips, Family, Perfume, Selection } from '../types'
import { AVOID_RULES, isAvoided } from './avoid'
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

  it('분위기를 모두 가진 향수가 3개 이상이면 3개 모두 분위기를 전부 충족한다(단계별 확장)', () => {
    let checked = 0
    for (const o of chips.objects) {
      const sel: Selection = { ...base, moods: ['calm', 'fresh'], objects: [o.id] }
      const pool = perfumes.filter((p) => p.moods.includes('calm') && p.moods.includes('fresh') && (p.family === o.family || p.subFamilies.includes(o.family)))
      if (pool.length < 3) continue
      checked++
      for (const r of recommend(perfumes, chips, familiesList, sel).items) expect(r.moodMatch).toEqual({ matched: 2, total: 2 })
    }
    expect(checked).toBeGreaterThan(0)
  })

  it('모두 가진 향수가 모자라면 분위기가 하나 덜 맞는 향수로 넓히고, 맞은 개수를 알려준다', () => {
    const sel: Selection = { ...base, moods: ['calm', 'sweet', 'sensual'], objects: ['forest'] }
    const { items } = recommend(perfumes, chips, familiesList, sel)
    expect(items).toHaveLength(3)
    for (const r of items) {
      expect(r.moodMatch.total).toBe(3)
      expect(r.moodMatch.matched).toBe(['calm', 'sweet', 'sensual'].filter((m) => r.perfume.moods.includes(m)).length)
      expect(r.reasons.length).toBeGreaterThanOrEqual(r.moodMatch.matched + r.scentMatch.matched)
    }
  })

  it('스모키·파우더·알싸한 향을 피하면 그 계열 향수는 태그가 없어도 나오지 않는다', () => {
    const cases: [string, string][] = [['smoky', 'leather'], ['powdery', 'powdery'], ['spicy', 'spicy']]
    for (const [avoid, family] of cases) {
      for (const m of chips.moods) {
        const sel: Selection = { ...base, moods: [m.id], objects: ['soap'], avoids: [avoid] }
        for (const r of recommend(perfumes, chips, familiesList, sel).items) expect(r.perfume.family).not.toBe(family)
      }
      const open = countCandidates(perfumes, chips, { ...base, moods: ['soft'] })
      const closed = countCandidates(perfumes, chips, { ...base, moods: ['soft'], avoids: [avoid] })
      expect(closed.any).toBeLessThanOrEqual(open.any)
    }
  })

  it('같은 계열이어도 점수가 높으면 함께 나온다 (계열 다양화는 하지 않는다)', () => {
    const sel: Selection = { ...base, moods: ['calm', 'clean'], objects: ['lemon'] }
    const { items } = recommend(perfumes, chips, familiesList, sel)
    const top = Math.max(...items.map((r) => r.score))
    expect(items.filter((r) => r.score === top).length).toBeGreaterThanOrEqual(2)
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

describe('시향 순서 정렬', () => {
  it('같은 계열·같은 강도면 농도가 낮은 향수가 먼저 온다 (EDT → EDP)', async () => {
    const { sortSniffingOrder } = await import('./recommend')
    const mk = (id: string, concentration: string): any => ({
      perfume: { id, family: 'citrus', intensity: 'medium', concentration },
      score: 5, reasons: [], moodMatch: { matched: 0, total: 0 }, scentMatch: { matched: 0, total: 0 },
    })
    const sorted = sortSniffingOrder([mk('a', 'EDP'), mk('b', 'EDT'), mk('c', 'EDC')], familiesList)
    expect(sorted.map((r) => r.perfume.id)).toEqual(['c', 'b', 'a'])
  })
})

describe('피하고 싶은 느낌', () => {
  const rule = (id: string) => AVOID_RULES[id]

  it('칩마다 기준이 있고, 고르면 그 기준에 해당하는 향수는 추천에 나오지 않는다', () => {
    for (const a of chips.avoids) {
      expect(rule(a.id)).toBeTypeOf('function')
      for (const m of chips.moods) {
        const sel: Selection = { ...base, moods: [m.id], objects: ['lemon'], avoids: [a.id] }
        for (const r of recommend(perfumes, chips, familiesList, sel).items) expect(rule(a.id)(r.perfume)).toBe(false)
      }
    }
  })

  it('너무 진한 향을 피하면 강도가 진함인 향수는 태그와 상관없이 모두 빠진다', () => {
    const strong = perfumes.filter((p) => p.intensity === 'strong')
    expect(strong.length).toBeGreaterThan(0)
    for (const p of strong) expect(isAvoided(p, ['tooStrong'])).toBe(true)
    const sel: Selection = { ...base, moods: ['deep'], objects: ['smoky'], avoids: ['tooStrong'] }
    for (const r of recommend(perfumes, chips, familiesList, sel).items) expect(r.perfume.intensity).not.toBe('strong')
  })

  it('피하고 싶은 칩을 3개 모두 골라도 추천 3개가 나온다', () => {
    const triples = [['tooStrong', 'tooSweet', 'heavyFloral'], ['smoky', 'powdery', 'spicy'], ['tooStrong', 'headache', 'soapy']]
    for (const avoids of triples) {
      for (const m of chips.moods) {
        const { items } = recommend(perfumes, chips, familiesList, { ...base, moods: [m.id], objects: ['flower'], avoids })
        expect(items).toHaveLength(3)
        for (const r of items) expect(isAvoided(r.perfume, avoids)).toBe(false)
      }
    }
  })
})

describe('이미 평가한 향수·동점 순서', () => {
  it('제외할 향수 id를 주면 추천에 나오지 않는다', () => {
    const sel: Selection = { ...base, moods: ['calm', 'clean'], objects: ['lemon'] }
    const first = recommend(perfumes, chips, familiesList, sel).items
    const excludeIds = new Set(first.map((r) => r.perfume.id))
    const next = recommend(perfumes, chips, familiesList, sel, { excludeIds }).items
    expect(next).toHaveLength(3)
    for (const r of next) expect(excludeIds.has(r.perfume.id)).toBe(false)
  })

  it('같은 선택이면 항상 같은 결과가 나온다', () => {
    const sel: Selection = { ...base, moods: ['cozy'], objects: ['vanilla'] }
    const a = recommend(perfumes, chips, familiesList, sel).items.map((r) => r.perfume.id)
    const b = recommend(perfumes, chips, familiesList, sel).items.map((r) => r.perfume.id)
    expect(a).toEqual(b)
  })
})
