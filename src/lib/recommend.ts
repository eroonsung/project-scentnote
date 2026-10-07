import type { Chips, Perfume, Selection } from '../types'

/**
 * 지금까지 고른 칩과 조금이라도 맞는 시향 후보 개수.
 * 피하고 싶은 칩과 겹치는 향수는 뺀다. (실제 추천 점수 계산은 Result 화면에서 확장한다)
 */
export function countCandidates(perfumes: Perfume[], chips: Chips, selection: Selection): number {
  const wantedFamilies = new Set<string>()
  selection.moods.forEach((id) => chips.moods.find((m) => m.id === id)?.affinity.forEach((f) => wantedFamilies.add(f)))
  selection.objects.forEach((id) => {
    const chip = chips.objects.find((o) => o.id === id)
    if (chip) wantedFamilies.add(chip.family)
  })
  if (wantedFamilies.size === 0 && selection.moods.length === 0) return 0

  return perfumes.filter((p) => {
    if (p.avoidFlags.some((f) => selection.avoids.includes(f))) return false
    const moodHit = p.moods.some((m) => selection.moods.includes(m))
    const familyHit = wantedFamilies.has(p.family) || p.subFamilies.some((f) => wantedFamilies.has(f))
    return moodHit || familyHit
  }).length
}
