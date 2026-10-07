import perfumesJson from '../data/perfumes.json'
import familiesJson from '../data/families.json'
import chipsJson from '../data/chips.json'
import tipsJson from '../data/tips.json'
import type { Chips, Family, Perfume } from '../types'

export const PERFUMES = perfumesJson as unknown as Perfume[]
export const FAMILIES = familiesJson as unknown as Family[]
export const CHIPS = chipsJson as unknown as Chips
export const TIPS = tipsJson as string[]

const familyById = new Map(FAMILIES.map((f) => [f.id, f]))
export const getFamily = (id: string): Family | undefined => familyById.get(id as Family['id'])

/** 병 이미지 경로. 이미지가 없으면 향 계열 색 대체 이미지 (D-24) */
export function imageSrc(p: Perfume): string {
  if (p.image) return `/perfumes/${p.image.file}`
  return placeholderSrc(p.family)
}

export function placeholderSrc(family: string): string {
  return `/perfumes/placeholder/${getFamily(family) ? family : 'default'}.svg`
}
