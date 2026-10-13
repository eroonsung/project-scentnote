import { describe, expect, it } from 'vitest'
import chipsJson from '../data/chips.json'
import familiesJson from '../data/families.json'
import perfumesJson from '../data/perfumes.json'
import type { Chips, Family, Perfume } from '../types'
import { recommendSimilar, similarity } from './similar'

const perfumes = perfumesJson as unknown as Perfume[]
const chips = chipsJson as unknown as Chips
const families = familiesJson as unknown as Family[]
const IR = { light: 0, medium: 1, strong: 2 } as const

describe('좋아하는 향수로 찾기', () => {
  it('어떤 향수를 골라도 항상 3개가 나오고, 고른 향수 자신은 나오지 않는다', () => {
    for (const p of perfumes) {
      const { items } = recommendSimilar(perfumes, chips, families, p.id, 'self')
      expect(items).toHaveLength(3)
      expect(items.some((r) => r.perfume.id === p.id)).toBe(false)
      expect(new Set(items.map((r) => r.perfume.id)).size).toBe(3)
    }
  })

  it('가벼운 향 → 진한 향 순서(강도 → 계열 → 농도)로 정렬된다', () => {
    const order = new Map(families.map((f) => [f.id, f.order]))
    for (const p of perfumes.slice(0, 60)) {
      const k = recommendSimilar(perfumes, chips, families, p.id, 'self').items.map((r) => [IR[r.perfume.intensity], order.get(r.perfume.family) ?? 99])
      expect(k).toEqual([...k].sort((a, b) => a[0] - b[0] || a[1] - b[1]))
    }
  })

  it('같은 향수를 고르면 항상 같은 결과가 나온다', () => {
    const a = recommendSimilar(perfumes, chips, families, perfumes[10].id, 'self').items.map((r) => r.perfume.id)
    const b = recommendSimilar(perfumes, chips, families, perfumes[10].id, 'self').items.map((r) => r.perfume.id)
    expect(a).toEqual(b)
  })

  it('닮은 정도는 두 향수를 바꿔도 같고, 자기 자신과 가장 닮았다', () => {
    const [a, b] = [perfumes[3], perfumes[40]]
    expect(similarity(a, b)).toBeCloseTo(similarity(b, a), 10)
    expect(similarity(a, a)).toBeGreaterThan(similarity(a, b))
  })

  it('별 1~2개를 준 향수(excludeIds)는 나오지 않는다', () => {
    const liked = perfumes[5]
    const first = recommendSimilar(perfumes, chips, families, liked.id, 'self').items
    const excluded = new Set(first.map((r) => r.perfume.id))
    const next = recommendSimilar(perfumes, chips, families, liked.id, 'self', { excludeIds: excluded }).items
    for (const r of next) expect(excluded.has(r.perfume.id)).toBe(false)
    expect(next).toHaveLength(3)
  })

  it('닮은 점(계열·분위기·노트)을 이유로 보여 준다', () => {
    const { items } = recommendSimilar(perfumes, chips, families, perfumes[20].id, 'self')
    for (const r of items) {
      expect(r.similarTo?.likedName).toContain(perfumes[20].nameKo)
      expect(r.reasons.length).toBeGreaterThan(0)
    }
  })

  it('선물이면 호불호가 큰 향수가 덜 나온다', () => {
    const count = (mode: 'self' | 'gift') =>
      perfumes.reduce((n, p) => n + recommendSimilar(perfumes, chips, families, p.id, mode).items.filter((r) => r.perfume.polarizing === 'high').length, 0)
    expect(count('gift')).toBeLessThanOrEqual(count('self'))
  })

  it('없는 향수 id면 빈 결과를 돌려준다', () => {
    expect(recommendSimilar(perfumes, chips, families, 'no-such', 'self').items).toHaveLength(0)
  })
})
