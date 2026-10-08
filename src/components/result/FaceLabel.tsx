import type { FamilyId } from '../../types'

/**
 * 카드 면 표시(CARD FRONT / CARD BACK): 앞면·뒷면이 같은 크기·위치로 쓴다.
 * 색은 서로 반대 면의 배경색을 쓴다 (앞면 라벨 = 뒷면 배경색, 뒷면 라벨 = 앞면 배경색)
 */
export default function FaceLabel({ family, face }: { family: FamilyId; face: 'front' | 'back' }) {
  const front = `var(--${family}-tint)`
  const back = `color-mix(in srgb, var(--${family}-tint), var(--${family}) 30%)`
  return (
    <span
      className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold tracking-[0.275px] text-ink"
      style={{
        background: face === 'front' ? back : front,
        borderColor: `color-mix(in srgb, var(--${family}), var(--ink) 25%)`,
      }}
    >
      {face === 'front' ? 'CARD FRONT' : 'CARD BACK'}
    </span>
  )
}
