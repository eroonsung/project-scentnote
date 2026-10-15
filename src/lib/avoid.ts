import type { Perfume } from '../types'
import { CHIPS } from './perfumes'

/**
 * "피하고 싶은 느낌" 칩이 어떤 향수를 거르는지의 기준.
 * 향수에 붙은 태그(avoidFlags)에 더해, 데이터의 강도·계열로도 걸러서 태그가 빠진 향수가 섞여 나오지 않게 한다.
 *
 * 계열 전체를 뜻하는 칩(예: '스모키한 향' = 레더 계열)은, 사용자가 그 계열의 향기를 직접 골랐다면
 * (예: '스모키'를 골랐다면) 대표·보조 계열이나 태그와 상관없이 '진한' 향수만 거른다(D-42, D-55).
 * "꽃은 좋은데 꽃향이 너무 강한 건 싫다"처럼 같은 향을 좋아하면서도 지나친 것만 피할 수 있게 하기 위해서다.
 */
interface Rule {
  /** 향수에 붙은 태그 */
  flag: string
  /** 이 계열(주 계열 또는 보조 계열)의 향수는 모두 해당 */
  families?: string[]
  /** 계열과 상관없이 해당하는 조건 */
  extra?: (p: Perfume) => boolean
}

export const AVOID_RULES: Record<string, Rule> = {
  tooStrong: { flag: 'tooStrong', extra: (p) => p.intensity === 'strong' },
  tooSweet: { flag: 'tooSweet', families: ['gourmand'] },
  headache: { flag: 'headache', extra: (p) => p.intensity === 'strong' && p.polarizing === 'high' && ['floral', 'whiteFloral', 'amber', 'gourmand'].includes(p.family) },
  heavyFloral: { flag: 'heavyFloral', families: ['whiteFloral'], extra: (p) => p.family === 'floral' && p.intensity === 'strong' },
  smoky: { flag: 'smoky', families: ['leather'] },
  powdery: { flag: 'powdery', families: ['powdery'] },
  spicy: { flag: 'spicy', families: ['spicy'] },
  soapy: { flag: 'soapy' },
}

/** 칩 id에서 계열을 알아낸다 */
export function chosenFamilies(objectIds: string[]): string[] {
  return objectIds.map((id) => CHIPS.objects.find((o) => o.id === id)?.family).filter((f): f is NonNullable<typeof f> => !!f)
}

/**
 * 이 칩이 뜻하는 향 계열. 사용자가 그 계열의 향기를 직접 골랐다면 "좋아하지만 지나친 건 싫다"로 보고
 * 그 계열은 진한 향수만 거른다(D-42, D-55). 계열과 상관없는 칩(너무 진한 향)은 비워 둔다.
 */
const LIKED_FAMILIES: Record<string, string[]> = {
  tooSweet: ['gourmand'],
  smoky: ['leather'],
  powdery: ['powdery'],
  spicy: ['spicy'],
  heavyFloral: ['whiteFloral', 'floral'],
  headache: ['floral', 'whiteFloral', 'amber', 'gourmand'],
  soapy: ['musk'],
}

/** 사용자가 이 칩이 뜻하는 계열의 향기를 직접 골랐는지 */
export function likesAvoidedFamily(avoidId: string, wanted: readonly string[]): boolean {
  return (LIKED_FAMILIES[avoidId] ?? []).some((f) => wanted.includes(f))
}

function matches(p: Perfume, avoidId: string, wanted: readonly string[]): boolean {
  const rule = AVOID_RULES[avoidId]
  if (!rule) return p.avoidFlags.includes(avoidId)
  // 이 칩에 해당하는지: 태그, 강도·계열 조건, 계열(대표 또는 보조)
  const hit =
    p.avoidFlags.includes(rule.flag) ||
    !!rule.extra?.(p) ||
    (!!rule.families && (rule.families.includes(p.family) || p.subFamilies.some((f) => rule.families!.includes(f))))
  if (!hit) return false
  // 그 계열의 향기를 직접 골랐다면, 대표 계열이든 보조 계열이든 태그만 붙은 향수든 진한 것만 거른다
  // ("꽃은 좋은데 꽃향이 너무 강한 건 싫다"처럼 같은 향을 좋아하면서 지나친 것만 피할 수 있게 하기 위해서다)
  if (likesAvoidedFamily(avoidId, wanted)) return p.intensity === 'strong' || !!rule.extra?.(p)
  return true
}

/** 고른 칩 중 하나라도 해당하면 거른다. wanted: 사용자가 고른 향기 칩의 계열 */
export function isAvoided(p: Perfume, avoids: string[], wanted: readonly string[] = []): boolean {
  return avoids.some((a) => matches(p, a, wanted))
}

/** 이 칩을 고르면 몇 종이 빠지는지 (고른 향기를 반영) */
export function avoidedCount(perfumes: Perfume[], avoidId: string, wanted: readonly string[] = []): number {
  return perfumes.filter((p) => isAvoided(p, [avoidId], wanted)).length
}

/**
 * 고른 분위기를 가진 향수가 피하고 싶은 칩 때문에 절반 아래로 줄어들면 알려 준다 (화면 안내용, D-56).
 * 예: 묵직한 + 너무 진한 향 제외 → 묵직한 향수 60개 중 19개만 남는다. 규칙을 바꾸는 것이 아니라 후보가 줄어든다는 사실을 알린다.
 */
export const SHRINK_RATIO = 0.45

export function moodShrinkNotes(
  perfumes: Perfume[],
  moodIds: string[],
  avoidIds: string[],
  objectIds: string[] = [],
): { mood: string; avoid: string; pool: number; left: number }[] {
  const wanted = chosenFamilies(objectIds)
  const notes: { mood: string; avoid: string; pool: number; left: number }[] = []
  for (const m of moodIds) {
    const pool = perfumes.filter((p) => p.moods.includes(m))
    if (pool.length < 10) continue
    for (const a of avoidIds) {
      const left = pool.filter((p) => !isAvoided(p, [a], wanted)).length
      if (left / pool.length < SHRINK_RATIO) {
        notes.push({
          mood: CHIPS.moods.find((x) => x.id === m)?.label ?? m,
          avoid: CHIPS.avoids.find((x) => x.id === a)?.label ?? a,
          pool: pool.length,
          left,
        })
      }
    }
  }
  return notes
}

/** 단어 끝에 받침이 있으면 '을', 없거나 한글이 아니면 '를' */
export function eulReul(word: string): '을' | '를' {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code <= 11171 && code % 28 !== 0 ? '을' : '를'
}

/** 단어 끝에 받침이 있으면 '은', 없거나 한글이 아니면 '는' */
export function eunNeun(word: string): '은' | '는' {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code <= 11171 && code % 28 !== 0 ? '은' : '는'
}

/**
 * 좋아하는 향기와 피하고 싶은 칩이 같은 계열이면, 그 향기 안에서 몇 개가 빠지는지 알려 준다 (화면 안내용).
 * 예: 스모키 향기 + 스모키한 향 제외 → { scent: '스모키', avoid: '스모키한 향', removed: 13, pool: 19 }
 */
export function likedAvoidNotes(
  perfumes: Perfume[],
  avoidIds: string[],
  objectIds: string[],
): { scent: string; avoid: string; removed: number; pool: number }[] {
  const wanted = chosenFamilies(objectIds)
  const notes: { scent: string; avoid: string; removed: number; pool: number }[] = []
  for (const a of avoidIds) {
    const hits = objectIds
      .map((id) => CHIPS.objects.find((o) => o.id === id))
      .filter((o): o is NonNullable<typeof o> => !!o && (LIKED_FAMILIES[a] ?? []).includes(o.family))
    if (hits.length === 0) continue
    const fams = hits.map((h) => h.family)
    const pool = perfumes.filter((p) => fams.includes(p.family) || p.subFamilies.some((f) => fams.includes(f)))
    notes.push({
      scent: hits.map((h) => h.label).join('·'),
      avoid: CHIPS.avoids.find((x) => x.id === a)?.label ?? a,
      removed: pool.filter((p) => isAvoided(p, [a], wanted)).length,
      pool: pool.length,
    })
  }
  return notes
}
