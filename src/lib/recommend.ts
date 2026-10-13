import type { Chips, FamilyId, Family, Perfume, Selection } from '../types'
import { AVOID_RULES, isAvoided } from './avoid'

export interface Recommendation {
  perfume: Perfume
  score: number
  /** 일치한 칩 이름 전부 (분위기 먼저, 향기 다음) → "추천 이유" 문구 */
  reasons: string[]
  /** 고른 분위기 중 이 향수가 가진 개수 */
  moodMatch: { matched: number; total: number }
  /** 고른 향기 중 이 향수의 계열(또는 서브 계열)과 맞는 개수 */
  scentMatch: { matched: number; total: number }
  /** 고른 분위기마다 이 향수의 정도: 2 = 대표, 1 = 은은함, 0 = 해당 없음 (카드의 분위기 점 표시) */
  moodDetail: { id: string; label: string; weight: 0 | 1 | 2 }[]
  /** 고른 향기 중 이 향수와 맞는 향기 칩 이름 */
  scentLabels: string[]
  /** 좋아하는 향수로 찾기: 어떤 향수와 어떤 점이 닮았는지 */
  similarTo?: { likedName: string; sameFamily: boolean; familyName: string; sharedMoods: string[]; sharedNotes: string[] }
}

export interface RecommendResult {
  items: Recommendation[]
  /** 조건에 딱 맞는 향이 적어 조건을 완화해서 채웠는지 */
  relaxed: boolean
  /** 고른 분위기·향기를 전부 가진 향수가 모자라 일부만 맞는 향수가 섞였는지 */
  partial: boolean
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
  const chosen = selection.objects.map((id) => chips.objects.find((o) => o.id === id)?.family).filter((f): f is NonNullable<typeof f> => !!f)
  const allowed = perfumes.filter((p) => !isAvoided(p, selection.avoids, chosen))
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

/** 문자열을 고정된 숫자로 바꾼다 (동점 순서를 섞는 데 쓴다) */
function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** 한 향수가 선택과 얼마나 맞는지 점수와 이유를 계산한다 */
export function scorePerfume(
  p: Perfume,
  chips: Chips,
  selection: Selection,
): Pick<Recommendation, 'score' | 'reasons' | 'moodMatch' | 'scentMatch' | 'moodDetail' | 'scentLabels'> {
  let score = 0
  const moodReasons: string[] = []
  const objectReasons: string[] = []
  const moodDetail: Recommendation['moodDetail'] = []

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
    // 분위기 정도: 대표 분위기(2점) +2, 은은한 분위기(1점) +1. 점수가 없는 데이터는 태그가 있으면 2점으로 본다
    const weight = (p.moodScores?.[id] ?? (p.moods.includes(id) ? 2 : 0)) as 0 | 1 | 2
    moodDetail.push({ id, label: chip.label, weight })
    if (weight > 0) {
      score += weight
      moodReasons.push(chip.label)
    } else if (chip.affinity.includes(p.family)) {
      score += 1
    }
  }
  // 피하고 싶은 칩의 태그가 붙어 있는데도 남은 향수(그 계열을 직접 골라서 허용된 경우)는 태그가 없는 향수보다 뒤로
  for (const a of selection.avoids) if (p.avoidFlags.includes(AVOID_RULES[a]?.flag ?? a)) score -= 1
  if (selection.mode === 'gift' || selection.unsure) {
    if (p.polarizing === 'low') score += 2
    if (p.polarizing === 'high') score -= 2
  }
  return {
    score,
    reasons: [...moodReasons, ...objectReasons],
    moodMatch: { matched: moodReasons.length, total: selection.moods.length },
    scentMatch: { matched: objectReasons.length, total: selection.objects.length },
    moodDetail,
    scentLabels: objectReasons,
  }
}

/** 농도가 낮을수록 가볍게 맡는다: 코롱(EDC) → EDT → EDP → 퍼퓸. 농도를 모르면 EDT와 EDP 사이로 본다 */
const CONCENTRATION_ORDER: Record<string, number> = { edc: 0, cologne: 0, edt: 1, 'cologne absolue': 2, edp: 2, parfum: 3, extrait: 3 }
const concentrationRank = (c: string | null | undefined) => CONCENTRATION_ORDER[(c ?? '').toLowerCase()] ?? 1.5

/** 시향 순서: 가벼운 향 → 진한 향 (강도 → 향 계열 order → 농도). 모두 같으면 뽑힌 순서(점수 순) 그대로 */
export function sortSniffingOrder(items: Recommendation[], families: Family[]): Recommendation[] {
  const order = new Map<FamilyId, number>(families.map((f) => [f.id, f.order]))
  return [...items].sort(
    (a, b) =>
      INTENSITY_ORDER[a.perfume.intensity] - INTENSITY_ORDER[b.perfume.intensity] ||
      (order.get(a.perfume.family) ?? 99) - (order.get(b.perfume.family) ?? 99) ||
      concentrationRank(a.perfume.concentration) - concentrationRank(b.perfume.concentration),
  )
}

/**
 * 추천 3개를 고른다.
 * 1) 피하고 싶은 칩과 겹치는 향수 제외 2) 점수 순 정렬(동점은 선택 조합마다 고정된 섞인 순서)
 * 3) 고른 향기 칩마다 그 계열에서 분위기가 가장 잘 맞는 향수를 1개씩 먼저 뽑고(고른 향기가 결과에 빠지지 않게),
 *    남은 자리는 고른 분위기를 모두 가진 향수(향기도 맞는)부터, 모자라면 분위기가 하나 덜 맞는 향수까지 단계적으로 넓혀 점수 순으로 채운다(계열이 겹쳐도 됨)
 * 4) 시향 순서(가벼운 향 → 진한 향)로 정렬
 */
export function recommend(
  perfumes: Perfume[],
  chips: Chips,
  families: Family[],
  selection: Selection,
  options: { excludeIds?: ReadonlySet<string> } = {},
): RecommendResult {
  const chosen = selection.objects.map((id) => chips.objects.find((o) => o.id === id)?.family).filter((f): f is NonNullable<typeof f> => !!f)
  const allowed = perfumes.filter((p) => !isAvoided(p, selection.avoids, chosen) && !options.excludeIds?.has(p.id))
  const scored: Recommendation[] = allowed.map((p) => ({ perfume: p, ...scorePerfume(p, chips, selection) }))

  // 동점이면 고른 조합마다 정해진 섞인 순서로 가른다(같은 선택이면 항상 같은 결과, 이름순·사진 유무에 치우치지 않게)
  const seed = [selection.mode, selection.moods, selection.objects, selection.avoids, selection.unsure].join('|')
  const tieBreak = new Map(scored.map((r) => [r.perfume.id, hashString(seed + r.perfume.id)]))
  scored.sort((a, b) => b.score - a.score || (tieBreak.get(a.perfume.id) ?? 0) - (tieBreak.get(b.perfume.id) ?? 0))

  const matched = scored.filter((r) => r.score > 0)
  const picked: Recommendation[] = []
  // 고른 분위기와 서로 어울리지 않는 분위기 태그를 가진 향수(예: '시원한'을 골랐는데 '따뜻한' 태그)는 마지막에만 쓴다
  const clashes = (r: Recommendation) =>
    selection.moods.some((m) => r.perfume.moods.some((pm) => chips.conflicts.some(([a, b]) => (a === m && b === pm) || (b === m && a === pm))))

  // 먼저, 고른 향기 칩이 2개 이상이면 칩마다 그 계열 향수를 1개씩 뽑는다 (고른 향기가 결과에서 빠지지 않도록).
  // 그 계열이 대표 계열이고, 반대 분위기 태그가 없고, 고른 분위기를 하나 이상 가진 향수 중에서 분위기를 많이 가진 → 점수 높은 순(동점은 섞인 순서).
  // 그런 향수가 그 계열에 없으면 억지로 넣지 않는다(분위기가 하나도 안 맞는 향수를 끼워 넣지 않기 위해).
  // 칩이 1개면 아래 단계별 확장이 이미 그 향기에 맞는 향수만 쓰므로 따로 하지 않는다.
  if (selection.objects.length >= 2) {
    const needMood = !selection.unsure && selection.moods.length > 0
    for (const id of selection.objects) {
      if (picked.length === 3) break
      const chip = chips.objects.find((o) => o.id === id)
      if (!chip || picked.some((r) => r.perfume.family === chip.family)) continue
      // matched는 이미 점수 순(동점은 섞인 순서)이고 sort는 안정 정렬이라, 분위기 일치 수가 같으면 그 순서가 유지된다
      const best = matched
        .filter((r) => r.perfume.family === chip.family && !clashes(r) && (!needMood || r.moodMatch.matched >= 1))
        .sort((x, y) => y.moodMatch.matched - x.moodMatch.matched)[0]
      if (best) picked.push(best)
    }
  }

  const fillFrom = (pool: Recommendation[]) => {
    // 나머지는 점수 순으로 채운다. 점수가 같은 향수끼리만, 이미 뽑힌 것과 세기·계열이 다른 향수를 먼저 쓴다
    // (비슷한 향수 3개보다 가볍게→진하게 순서가 의미 있도록). 점수가 더 높은 향수를 건너뛰지는 않는다.
    while (picked.length < 3) {
      const remaining = pool.filter((r) => !picked.includes(r))
      if (remaining.length === 0) break
      const tied = remaining.filter((r) => r.score === remaining[0].score)
      const seenIntensity = new Set(picked.map((r) => r.perfume.intensity))
      const seenFamily = new Set(picked.map((r) => r.perfume.family))
      const variety = (r: Recommendation) => (seenIntensity.has(r.perfume.intensity) ? 0 : 2) + (seenFamily.has(r.perfume.family) ? 0 : 1)
      picked.push(tied.reduce((best, r) => (variety(r) > variety(best) ? r : best), tied[0]))
    }
  }

  // 단계별로 넓힌다: 고른 분위기를 모두 가진 향수 → (3개가 안 되면) 하나 적게 가진 향수 → … → 하나라도 가진 향수.
  // 고른 향기가 있으면 향기도 맞는 향수만 쓴다. 분위기를 안 골랐으면(잘 모르겠어요 등) 점수 순.
  const scentOk = (r: Recommendation) => selection.objects.length === 0 || r.scentMatch.matched > 0
  const moodCount = selection.unsure ? 0 : selection.moods.length
  // 선물이면 호불호가 큰 향수도 마지막에만 쓴다(선물은 실패 확률이 낮은 후보가 우선)
  const risky = (r: Recommendation) => (selection.mode === 'gift' || selection.unsure) && r.perfume.polarizing === 'high'
  if (moodCount > 0) {
    for (let level = moodCount; level >= 1 && picked.length < 3; level--) {
      fillFrom(matched.filter((r) => scentOk(r) && !clashes(r) && !risky(r) && r.moodMatch.matched >= level))
    }
  } else {
    fillFrom(matched.filter(scentOk))
  }
  // 그래도 모자라면 반대 분위기 태그가 있는 향수까지(고른 향기는 맞는 향수 먼저), 그다음 향기나 분위기가 덜 맞는 향수까지
  fillFrom(matched.filter((r) => !picked.includes(r) && scentOk(r)))
  fillFrom(matched.filter((r) => !picked.includes(r)))
  // 그래도 모자라면 조건을 완화해서 (호불호 적은 향 우선) 채운다
  let relaxed = false
  if (picked.length < 3) {
    relaxed = true
    const rest = scored.filter((r) => !picked.includes(r))
    rest.sort((a, b) => Number(b.perfume.polarizing === 'low') - Number(a.perfume.polarizing === 'low') || (tieBreak.get(a.perfume.id) ?? 0) - (tieBreak.get(b.perfume.id) ?? 0))
    for (const r of rest) {
      if (picked.length === 3) break
      picked.push(r)
    }
  }
  const partial = picked.some((r) => r.moodMatch.matched < r.moodMatch.total || r.scentMatch.matched < r.scentMatch.total)
  return { items: sortSniffingOrder(picked, families), relaxed, partial }
}
