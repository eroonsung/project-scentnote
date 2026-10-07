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

  it('후보 개수는 분위기 태그가 직접 붙은 향수만 센다', () => {
    const n = countCandidates(perfumes, chips, { ...base, moods: ['calm', 'clean'] })
    const expected = perfumes.filter((p) => p.moods.includes('calm') || p.moods.includes('clean')).length
    expect(n).toBe(expected)
  })

  it('피하고 싶은 칩이 있으면 후보 개수에서 뺀다', () => {
    const all = countCandidates(perfumes, chips, { ...base, moods: ['sweet'] })
    const fewer = countCandidates(perfumes, chips, { ...base, moods: ['sweet'], avoids: ['tooSweet'] })
    expect(fewer).toBeLessThan(all)
  })
})
