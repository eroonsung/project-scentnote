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
    // 구르망 향기를 직접 골랐으므로 구르망 계열은 진한 향수만 거르고(D-42), 다른 계열은 '너무 단 향' 태그가 있으면 거른다
    for (const r of items) {
      if (r.perfume.family === 'gourmand') expect(r.perfume.intensity).not.toBe('strong')
      else expect(r.perfume.avoidFlags).not.toContain('tooSweet')
    }
  })

  it('시향 순서는 강도(가벼움 → 진함) → 향 계열 순서로 정렬된다', () => {
    const s: Selection = { ...base, moods: ['calm', 'clean'], objects: ['rain', 'soap', 'forest'] }
    const { items } = recommend(perfumes, chips, familiesList, s)
    const order = new Map(familiesList.map((f) => [f.id, f.order]))
    const rank = { light: 0, medium: 1, strong: 2 } as const
    const keys = items.map((r) => [rank[r.perfume.intensity], order.get(r.perfume.family) ?? 99])
    expect(keys).toEqual([...keys].sort((a, b) => a[0] - b[0] || a[1] - b[1]))
  })

  it('고른 향기 칩이 2~3개면 칩마다 그 계열(대표 계열) 향수가 하나씩 나온다', () => {
    const cases = [['rain', 'soap', 'forest'], ['rain', 'forest'], ['soap', 'lemon', 'herb']]
    for (const objects of cases) {
      const s: Selection = { ...base, moods: ['calm', 'clean'], objects }
      const got = new Set(recommend(perfumes, chips, familiesList, s).items.map((r) => r.perfume.family))
      for (const id of objects) expect(got.has(chips.objects.find((o) => o.id === id)!.family)).toBe(true)
    }
  })

  it('고른 분위기를 가진 향수가 없는 계열은 억지로 넣지 않는다 (분위기가 하나도 안 맞는 향수를 끼워 넣지 않음)', () => {
    // 달콤한·매혹적인 분위기에 맞는 시트러스가 거의 없다: 레몬 칩이 있어도 분위기 0개짜리 시트러스를 넣지 않는다
    const s: Selection = { ...base, moods: ['calm', 'sweet', 'sensual'], objects: ['lemon', 'vanilla', 'smoky'] }
    const { items } = recommend(perfumes, chips, familiesList, s)
    for (const r of items) expect(r.moodMatch.matched).toBeGreaterThanOrEqual(1)
  })

  it('일부만 맞는 향수가 섞이면 partial로 알린다', () => {
    const s: Selection = { ...base, moods: ['calm', 'sweet', 'sensual'], objects: ['forest'] }
    const r = recommend(perfumes, chips, familiesList, s)
    expect(r.partial).toBe(r.items.some((x) => x.moodMatch.matched < 3))
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

describe('선물하기', () => {
  it('호불호가 큰 향수는 다른 후보로 3개를 채울 수 있으면 쓰지 않는다', () => {
    let checked = 0
    for (const m of chips.moods) {
      const ok = perfumes.filter((p) => p.polarizing !== 'high' && p.moods.includes(m.id))
      if (ok.length < 3) continue
      checked++
      const { items } = recommend(perfumes, chips, familiesList, { ...base, mode: 'gift', moods: [m.id] })
      for (const r of items) expect(r.perfume.polarizing).not.toBe('high')
    }
    expect(checked).toBeGreaterThan(5)
  })

  it('잘 모르겠어요이면 호불호가 적은 향수만 나오고 항상 3개다', () => {
    const { items } = recommend(perfumes, chips, familiesList, { ...base, mode: 'gift', unsure: true })
    expect(items).toHaveLength(3)
    for (const r of items) expect(r.perfume.polarizing).toBe('low')
  })
})

describe('시향 순서 정렬', () => {
  it('계열 순서가 늦어도 강도가 가벼우면 먼저 온다', async () => {
    const { sortSniffingOrder } = await import('./recommend')
    const mk = (id: string, family: string, intensity: string): any => ({
      perfume: { id, family, intensity, concentration: 'EDP' },
      score: 5, reasons: [], moodMatch: { matched: 0, total: 0 }, scentMatch: { matched: 0, total: 0 },
    })
    const sorted = sortSniffingOrder([mk('a', 'citrus', 'strong'), mk('b', 'musk', 'light')], familiesList)
    expect(sorted.map((r) => r.perfume.id)).toEqual(['b', 'a'])
  })

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

  it('칩마다 기준이 있고, 고르면 그 기준에 해당하는 향수는 추천에 나오지 않는다', () => {
    for (const a of chips.avoids) {
      expect(AVOID_RULES[a.id]).toBeDefined()
      for (const m of chips.moods) {
        const sel: Selection = { ...base, moods: [m.id], objects: ['lemon'], avoids: [a.id] }
        for (const r of recommend(perfumes, chips, familiesList, sel).items) expect(isAvoided(r.perfume, [a.id], ['citrus'])).toBe(false)
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
        for (const r of items) expect(isAvoided(r.perfume, avoids, ['floral'])).toBe(false)
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

describe('점수가 같을 때의 선택', () => {
  it('점수가 같으면 세기가 다른 향수를 함께 고르고, 점수가 더 높은 향수는 건너뛰지 않는다', () => {
    const src = perfumes.find((p) => p.family === 'woody')!
    const mk = (id: string, intensity: Perfume['intensity'], moods: string[]): Perfume => ({ ...src, id, intensity, moods, subFamilies: [], avoidFlags: [], concentration: 'EDP' })
    const list = [mk('s1', 'strong', ['calm']), mk('s2', 'strong', ['calm']), mk('l1', 'light', ['calm']), mk('m1', 'medium', ['calm']), mk('top', 'strong', ['calm', 'fresh'])]
    const sel: Selection = { ...base, moods: ['calm', 'fresh'], objects: ['forest'] }
    const ids = recommend(list, chips, familiesList, sel).items.map((r) => r.perfume.id)
    expect(ids).toContain('top')
    const rest = list.filter((p) => ids.includes(p.id) && p.id !== 'top').map((p) => p.intensity)
    expect(new Set(rest).size).toBe(rest.length)
  })
})

describe('향기를 고르고도 그 향의 지나친 것만 피하기', () => {
  it('꽃을 좋아하면서 꽃향이 강한 향을 피하면, 꽃 향수는 진한 것만 빠진다', () => {
    const open = perfumes.filter((p) => p.family === 'whiteFloral')
    expect(open.length).toBeGreaterThan(0)
    for (const p of open) expect(isAvoided(p, ['heavyFloral'])).toBe(true) // 하얀 꽃을 고르지 않았으면 전부 빠진다
    const kept = open.filter((p) => !isAvoided(p, ['heavyFloral'], ['whiteFloral']))
    expect(kept.length).toBeGreaterThan(0) // 하얀 꽃을 골랐으면 진하지 않은 것은 남는다
    for (const p of open.filter((p) => isAvoided(p, ['heavyFloral'], ['whiteFloral']))) {
      expect(p.intensity === 'strong' || p.avoidFlags.includes('heavyFloral')).toBe(true)
    }
  })

  it('스모키를 고르고 스모키 제외도 고르면 진한 레더만 빠지고, 태그가 없는 향수가 먼저 나온다', () => {
    const sel: Selection = { ...base, moods: ['deep'], objects: ['smoky'], avoids: ['smoky'] }
    const { items } = recommend(perfumes, chips, familiesList, sel)
    expect(items).toHaveLength(3)
    for (const r of items) expect(r.perfume.family === 'leather' ? r.perfume.intensity : 'ok').not.toBe('strong')
    // 점수가 같다면 태그 없는 향수가 태그 있는 향수보다 앞선다
    const tagged = items.filter((r) => r.perfume.avoidFlags.includes('smoky')).length
    expect(tagged).toBeLessThanOrEqual(items.length)
  })
})

describe('고른 분위기와 반대인 향수', () => {
  it('후보가 충분하면 고른 분위기와 어울리지 않는 분위기 태그를 가진 향수는 나오지 않는다', () => {
    const clash = (moods: string[], perfumeMoods: string[]) =>
      moods.some((m) => perfumeMoods.some((pm) => chips.conflicts.some(([a, b]) => (a === m && b === pm) || (b === m && a === pm))))
    let checked = 0
    for (const o of chips.objects) {
      const moods = ['lovely', 'cool']
      const pool = perfumes.filter((p) => moods.some((m) => p.moods.includes(m)) && !clash(moods, p.moods) && (p.family === o.family || p.subFamilies.includes(o.family)))
      if (pool.length < 3) continue
      checked++
      for (const r of recommend(perfumes, chips, familiesList, { ...base, moods, objects: [o.id] }).items) expect(clash(moods, r.perfume.moods)).toBe(false)
    }
    expect(checked).toBeGreaterThan(3)
  })
})

describe('분위기 정도 점수(moodScores)', () => {
  it('모든 향수의 분위기 점수는 1·2이고, moods는 점수가 있는 분위기와 같다', () => {
    for (const p of perfumes) {
      const scored = Object.keys(p.moodScores ?? {})
      expect([...scored].sort()).toEqual([...p.moods].sort())
      for (const v of Object.values(p.moodScores ?? {})) expect([1, 2]).toContain(v)
    }
  })

  it('서로 반대인 분위기(시원한↔따뜻한)는 한 향수에 함께 있지 않다', () => {
    for (const p of perfumes) for (const [a, b] of chips.conflicts) expect(p.moods.includes(a) && p.moods.includes(b)).toBe(false)
  })

  it('사랑스러운 + 매혹적인을 골라도 두 분위기를 모두 가진 향수가 먼저 나온다', () => {
    const { items } = recommend(perfumes, chips, familiesList, { ...base, moods: ['lovely', 'sensual'], objects: ['flower'] })
    expect(items).toHaveLength(3)
    for (const r of items) expect(r.moodMatch).toEqual({ matched: 2, total: 2 })
  })

  it('같은 분위기라면 대표(2점)인 향수가 은은한(1점) 향수보다 점수가 높다', async () => {
    const { scorePerfume } = await import('./recommend')
    const strong = perfumes.find((p) => p.moodScores?.lovely === 2)!
    const weak = perfumes.find((p) => p.moodScores?.lovely === 1 && p.family === strong.family)
    expect(weak).toBeDefined()
    const sel: Selection = { ...base, moods: ['lovely'] }
    expect(scorePerfume(strong, chips, sel).score).toBeGreaterThan(scorePerfume(weak!, chips, sel).score)
  })
})
