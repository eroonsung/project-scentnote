import type { Perfume } from '../types'

/**
 * "피하고 싶은 느낌" 칩이 어떤 향수를 거르는지의 기준.
 * 향수에 붙은 태그(avoidFlags)에 더해, 데이터의 강도·계열로도 걸러서 태그가 빠진 향수가 섞여 나오지 않게 한다.
 */
const tagged = (p: Perfume, flag: string) => p.avoidFlags.includes(flag)
const inFamily = (p: Perfume, ...fs: string[]) => fs.includes(p.family)
const hasSub = (p: Perfume, f: string) => p.subFamilies.includes(f as Perfume['subFamilies'][number])

export const AVOID_RULES: Record<string, (p: Perfume) => boolean> = {
  // 너무 진한 향: 강도가 '진함'인 향수 전부
  tooStrong: (p) => p.intensity === 'strong' || tagged(p, 'tooStrong'),
  // 너무 단 향: 구르망 계열 전부
  tooSweet: (p) => inFamily(p, 'gourmand') || tagged(p, 'tooSweet'),
  // 머리 아픈 향: 진하고 호불호가 큰 꽃·앰버·구르망 향수
  headache: (p) => (p.intensity === 'strong' && p.polarizing === 'high' && inFamily(p, 'floral', 'whiteFloral', 'amber', 'gourmand')) || tagged(p, 'headache'),
  // 꽃향이 강한 향: 화이트 플로럴 전부, 진한 플로럴
  heavyFloral: (p) => inFamily(p, 'whiteFloral') || (inFamily(p, 'floral') && p.intensity === 'strong') || tagged(p, 'heavyFloral'),
  // 스모키한 향: 레더 계열 전부
  smoky: (p) => inFamily(p, 'leather') || tagged(p, 'smoky'),
  // 화장품 파우더 향: 파우더리 계열, 파우더리가 보조 계열인 향수
  powdery: (p) => inFamily(p, 'powdery') || hasSub(p, 'powdery') || tagged(p, 'powdery'),
  // 알싸한 향: 스파이시 계열, 스파이시가 보조 계열인 향수
  spicy: (p) => inFamily(p, 'spicy') || hasSub(p, 'spicy') || tagged(p, 'spicy'),
  // 비누·세제 같은 향: 향수에 붙은 태그만 (머스크 계열 전체가 비누 향은 아니라서)
  soapy: (p) => tagged(p, 'soapy'),
}

/** 고른 칩 중 하나라도 해당하면 거른다 */
export function isAvoided(p: Perfume, avoids: string[]): boolean {
  return avoids.some((a) => (AVOID_RULES[a] ? AVOID_RULES[a](p) : tagged(p, a)))
}

/** 이 칩을 고르면 몇 종이 빠지는지 */
export function avoidedCount(perfumes: Perfume[], avoidId: string): number {
  return perfumes.filter((p) => isAvoided(p, [avoidId])).length
}
