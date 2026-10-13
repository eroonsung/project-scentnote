import type { Chips, Family, FamilyId, Perfume } from '../types'
import { sortSniffingOrder, type Recommendation, type RecommendResult } from './recommend'

/**
 * 좋아하는 향수와 닮은 향을 찾는다 (D-53).
 * 닮은 정도 = 분위기 점수 모양(40%) + 향 계열(25%) + 노트 겹침(25%) + 세기(10%).
 * 새 데이터 없이 분위기 정도 점수(moodScores)·계열·노트·강도로 계산하고, 3개는 지금과 같이 가벼운 향부터 맡는 순서로 정렬한다.
 */

const MOOD_IDS = ['calm', 'clean', 'cool', 'cozy', 'fresh', 'zesty', 'warm', 'sweet', 'lovely', 'elegant', 'deep', 'sensual', 'soft'] as const
const INTENSITY = { light: 0, medium: 1, strong: 2 } as const
const W = { mood: 0.4, family: 0.25, notes: 0.25, intensity: 0.1 }

const moodVec = (p: Perfume) => MOOD_IDS.map((m) => p.moodScores?.[m] ?? (p.moods.includes(m) ? 2 : 0))

function cosine(a: number[], b: number[]): number {
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return na === 0 || nb === 0 ? 0 : dot / Math.sqrt(na * nb)
}

const noteKeys = (p: Perfume) =>
  new Map([...p.notes.top, ...p.notes.middle, ...p.notes.base].map((n) => [n.en.trim().toLowerCase(), n.ko] as const))

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const k of a) if (b.has(k)) inter++
  return inter / (a.size + b.size - inter)
}

function familyScore(a: Perfume, b: Perfume): number {
  if (a.family === b.family) return 1
  const aa = new Set<FamilyId>([a.family, ...a.subFamilies])
  const bb = new Set<FamilyId>([b.family, ...b.subFamilies])
  for (const f of aa) if (bb.has(f)) return 0.5
  return 0
}

/** 두 향수가 얼마나 닮았는지 (0~1) */
export function similarity(liked: Perfume, p: Perfume): number {
  const notesA = noteKeys(liked)
  const notesB = noteKeys(p)
  return (
    W.mood * cosine(moodVec(liked), moodVec(p)) +
    W.family * familyScore(liked, p) +
    W.notes * jaccard(new Set(notesA.keys()), new Set(notesB.keys())) +
    W.intensity * (1 - Math.abs(INTENSITY[liked.intensity] - INTENSITY[p.intensity]) / 2)
  )
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * 좋아하는 향수와 닮은 향 3개 (시향 순서로 정렬).
 * 선물이면 호불호가 적은 향을 조금 더 앞세우고 큰 향은 조금 뒤로 민다. 별 1~2개를 준 향수(excludeIds)는 뺀다.
 */
export function recommendSimilar(
  perfumes: Perfume[],
  chips: Chips,
  families: Family[],
  likedId: string,
  mode: 'self' | 'gift',
  options: { excludeIds?: ReadonlySet<string> } = {},
): RecommendResult {
  const liked = perfumes.find((p) => p.id === likedId)
  if (!liked) return { items: [], relaxed: false, partial: false }
  const label = (id: string) => chips.moods.find((m) => m.id === id)?.label ?? id
  const likedMoods = moodVec(liked)
  const likedNotes = noteKeys(liked)
  const familyName = families.find((f) => f.id === liked.family)?.name ?? ''

  const scored = perfumes
    .filter((p) => p.id !== liked.id && !options.excludeIds?.has(p.id))
    .map((p) => {
      let sim = similarity(liked, p)
      if (mode === 'gift') sim += p.polarizing === 'low' ? 0.04 : p.polarizing === 'high' ? -0.06 : 0
      return { p, sim, tie: hashString(liked.id + p.id) }
    })
    .sort((a, b) => b.sim - a.sim || a.tie - b.tie)

  const items: Recommendation[] = scored.slice(0, 3).map(({ p, sim }) => {
    const pv = moodVec(p)
    const strength = (i: number) => Math.min(likedMoods[i], pv[i])
    const sharedMoods = MOOD_IDS.map((id, i) => ({ id, w: strength(i) }))
      .filter((m) => m.w > 0)
      .sort((x, y) => y.w - x.w)
      .slice(0, 3)
      .map((m) => label(m.id))
    const pn = noteKeys(p)
    const sharedNotes = [...likedNotes].filter(([k]) => pn.has(k)).map(([, ko]) => ko).slice(0, 3)
    const sameFamily = p.family === liked.family
    const reasons = [
      ...(sameFamily ? [`같은 ${familyName} 계열`] : []),
      ...(sharedMoods.length ? [`분위기 ${sharedMoods.join('·')}`] : []),
      ...(sharedNotes.length ? [`노트 ${sharedNotes.join('·')}`] : []),
    ]
    return {
      perfume: p,
      score: Math.round(sim * 100),
      reasons,
      moodMatch: { matched: 0, total: 0 },
      scentMatch: { matched: 0, total: 0 },
      moodDetail: [],
      scentLabels: [],
      similarTo: { likedName: `${liked.brandKo} ${liked.nameKo}`, sameFamily, familyName, sharedMoods, sharedNotes },
    }
  })
  return { items: sortSniffingOrder(items, families), relaxed: false, partial: false }
}
