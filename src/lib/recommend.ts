import type { Chips, FamilyId, Family, Perfume, Selection } from '../types'

export interface Recommendation {
  perfume: Perfume
  score: number
  /** 일치한 칩 이름 (최대 2개) → "추천 이유" 문구 */
  reasons: string[]
}

export interface RecommendResult {
  items: Recommendation[]
  /** 조건에 딱 맞는 향이 적어 조건을 완화해서 채웠는지 */
  relaxed: boolean
}

const INTENSITY_ORDER = { light: 0, medium: 1, strong: 2 } as const

function wantedFamilies(chips: Chips, selection: Selection): Set<string> {
  const set = new Set<string>()
  selection.moods.forEach((id) => chips.moods.find((m) => m.id === id)?.affinity.forEach((f) => set.add(f)))
  selection.objects.forEach((id) => {
    const chip = chips.objects.find((o) => o.id === id)
    if (chip) set.add(chip.family)
  })
  return set
}

export interface CandidateCount {
  /** 고른 분위기를 모두 가진 향수 수 (칩을 더할수록 줄어든다) */
  all: number
  /** 고른 분위기 중 하나라도 가진 향수 수 (칩을 더할수록 늘어난다) */
  any: number
}

/**
 * 지금까지 고른 칩과 맞는 시향 후보 개수 (Select 화면의 "어울리는 향수 미리보기" 숫자).
 * 분위기 태그가 직접 붙은 향수만 센다(향 계열만 겹치는 향수는 세지 않는다). 피하고 싶은 칩과 겹치는 향수는 뺀다.
 * 모두 맞는 향수는 칩을 더할수록 금방 0이 되므로, 추천은 '하나라도 맞는' 향수까지 넓혀서 점수 순으로 뽑는다(recommend()).
 */
export function countCandidates(perfumes: Perfume[], chips: Chips, selection: Selection): CandidateCount {
  const allowed = perfumes.filter((p) => !p.avoidFlags.some((f) => selection.avoids.includes(f)))
  if (selection.unsure) {
    const n = allowed.filter((p) => p.polarizing === 'low').length
    return { all: n, any: n }
  }
  if (selection.moods.length > 0) {
    return {
      all: allowed.filter((p) => selection.moods.every((m) => p.moods.includes(m))).length,
      any: allowed.filter((p) => p.moods.some((m) => selection.moods.includes(m))).length,
    }
  }
  const wanted = wantedFamilies(chips, { ...selection, moods: [] })
  if (wanted.size === 0) return { all: 0, any: 0 }
  const n = allowed.filter((p) => wanted.has(p.family) || p.subFamilies.some((f) => wanted.has(f))).length
  return { all: n, any: n }
}

/** 고른 분위기(하나라도)와 고른 향기(계열 또는 서브 계열)를 모두 충족하는지. 고르지 않은 쪽은 따지지 않는다 */
function meetsEveryChoice(p: Perfume, chips: Chips, selection: Selection): boolean {
  const moodOk = selection.moods.length === 0 || selection.moods.some((m) => p.moods.includes(m))
  const families = selection.objects.map((id) => chips.objects.find((o) => o.id === id)?.family)
  const scentOk = families.length === 0 || families.some((f) => f && (p.family === f || p.subFamilies.includes(f)))
  return moodOk && scentOk
}

/** 한 향수가 선택과 얼마나 맞는지 점수와 이유를 계산한다 */
export function scorePerfume(p: Perfume, chips: Chips, selection: Selection): { score: number; reasons: string[] } {
  let score = 0
  const moodReasons: string[] = []
  const objectReasons: string[] = []

  for (const id of selection.objects) {
    const chip = chips.objects.find((o) => o.id === id)
    if (!chip) continue
    if (chip.family === p.family) {
      score += 3
      objectReasons.push(chip.label)
    } else if (p.subFamilies.includes(chip.family)) {
      score += 2
      objectReasons.push(chip.label)
    }
  }
  for (const id of selection.moods) {
    const chip = chips.moods.find((m) => m.id === id)
    if (!chip) continue
    if (p.moods.includes(id)) {
      score += 2
      moodReasons.push(chip.label)
    } else if (chip.affinity.includes(p.family)) {
      score += 1
    }
  }
  if (selection.mode === 'gift' || selection.unsure) {
    if (p.polarizing === 'low') score += 2
    if (p.polarizing === 'high') score -= 2
  }
  return { score, reasons: [...moodReasons.slice(0, 1), ...objectReasons.slice(0, 1)] }
}

/** 시향 순서: 가벼운 향 → 진한 향 (향 계열 order → 강도) */
export function sortSniffingOrder(items: Recommendation[], families: Family[]): Recommendation[] {
  const order = new Map<FamilyId, number>(families.map((f) => [f.id, f.order]))
  return [...items].sort(
    (a, b) =>
      (order.get(a.perfume.family) ?? 99) - (order.get(b.perfume.family) ?? 99) ||
      INTENSITY_ORDER[a.perfume.intensity] - INTENSITY_ORDER[b.perfume.intensity],
  )
}

/**
 * 추천 3개를 고른다.
 * 1) 피하고 싶은 칩과 겹치는 향수 제외 2) 점수 순 정렬(동점이면 이미지·가격이 있는 향수 먼저)
 * 3) 고른 분위기와 향기를 둘 다 충족하는 향수를 먼저 뽑는다. 고른 향기 칩마다 그 계열 향수를 1개씩 먼저, 나머지는 주 계열이 겹치지 않게(부족하면 겹침 허용). 3개가 안 되면 하나만 맞는 향수로 같은 방식으로 채운다
 * 4) 시향 순서(가벼운 향 → 진한 향)로 정렬
 */
export function recommend(perfumes: Perfume[], chips: Chips, families: Family[], selection: Selection): RecommendResult {
  const allowed = perfumes.filter((p) => !p.avoidFlags.some((f) => selection.avoids.includes(f)))
  const scored: Recommendation[] = allowed.map((p) => ({ perfume: p, ...scorePerfume(p, chips, selection) }))

  const completeness = (r: Recommendation) => (r.perfume.image ? 1 : 0) + (r.perfume.krPrice ? 1 : 0)
  scored.sort((a, b) => b.score - a.score || completeness(b) - completeness(a) || a.perfume.id.localeCompare(b.perfume.id))

  const matched = scored.filter((r) => r.score > 0)
  // 고른 분위기와 고른 향기를 둘 다 충족하는 향수를 먼저, 그다음 하나만 맞는 향수로 채운다
  const both = matched.filter((r) => meetsEveryChoice(r.perfume, chips, selection))
  const rest = matched.filter((r) => !both.includes(r))
  const picked: Recommendation[] = []
  const usedFamilies = new Set<FamilyId>()
  const fillFrom = (pool: Recommendation[]) => {
    // 고른 향기 칩마다 그 계열에서 가장 잘 맞는 향수를 하나씩 먼저 뽑는다 (고른 느낌이 결과에 하나씩 보이도록)
    for (const id of selection.objects) {
      if (picked.length === 3) break
      const chip = chips.objects.find((o) => o.id === id)
      if (!chip || picked.some((r) => r.perfume.family === chip.family)) continue
      const hit = pool.find((r) => !picked.includes(r) && r.perfume.family === chip.family)
      if (hit) {
        picked.push(hit)
        usedFamilies.add(hit.perfume.family)
      }
    }
    for (const r of pool) {
      if (picked.length === 3) break
      if (!usedFamilies.has(r.perfume.family)) {
        picked.push(r)
        usedFamilies.add(r.perfume.family)
      }
    }
    // 계열이 겹쳐도 되니 점수 순으로 채운다
    for (const r of pool) {
      if (picked.length === 3) break
      if (!picked.includes(r)) picked.push(r)
    }
  }
  fillFrom(both)
  fillFrom(rest)
  // 그래도 모자라면 조건을 완화해서 (호불호 적은 향 우선) 채운다
  let relaxed = false
  if (picked.length < 3) {
    relaxed = true
    const rest = scored.filter((r) => !picked.includes(r))
    rest.sort((a, b) => Number(b.perfume.polarizing === 'low') - Number(a.perfume.polarizing === 'low') || completeness(b) - completeness(a))
    for (const r of rest) {
      if (picked.length === 3) break
      picked.push(r)
    }
  }
  return { items: sortSniffingOrder(picked, families), relaxed }
}
