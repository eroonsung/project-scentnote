import type { Perfume } from '../types'
import { CHIPS } from './perfumes'

/**
 * "피하고 싶은 느낌" 칩이 어떤 향수를 거르는지의 기준.
 * 향수에 붙은 태그(avoidFlags)에 더해, 데이터의 강도·계열로도 걸러서 태그가 빠진 향수가 섞여 나오지 않게 한다.
 *
 * 계열 전체를 뜻하는 칩(예: '스모키한 향' = 레더 계열)은, 사용자가 그 계열의 향기를 직접 골랐다면
 * (예: '스모키'를 골랐다면) 그 계열 안에서 '진한' 향수와 태그가 붙은 향수만 거른다.
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

function matches(p: Perfume, avoidId: string, wanted: readonly string[]): boolean {
  const rule = AVOID_RULES[avoidId]
  if (!rule) return p.avoidFlags.includes(avoidId)
  // 사용자가 이 칩이 뜻하는 계열의 향기를 직접 골랐다면, 그 계열 향수는 진한 것만 거른다
  // (그 계열 향수에는 태그가 거의 다 붙어 있어서 태그를 그대로 쓰면 하나도 남지 않는다)
  if (rule.families?.includes(p.family) && wanted.includes(p.family)) return p.intensity === 'strong' || !!rule.extra?.(p)
  if (p.avoidFlags.includes(rule.flag) || rule.extra?.(p)) return true
  return !!rule.families && (rule.families.includes(p.family) || p.subFamilies.some((f) => rule.families!.includes(f)))
}

/** 고른 칩 중 하나라도 해당하면 거른다. wanted: 사용자가 고른 향기 칩의 계열 */
export function isAvoided(p: Perfume, avoids: string[], wanted: readonly string[] = []): boolean {
  return avoids.some((a) => matches(p, a, wanted))
}

/** 이 칩을 고르면 몇 종이 빠지는지 (고른 향기를 반영) */
export function avoidedCount(perfumes: Perfume[], avoidId: string, wanted: readonly string[] = []): number {
  return perfumes.filter((p) => isAvoided(p, [avoidId], wanted)).length
}
