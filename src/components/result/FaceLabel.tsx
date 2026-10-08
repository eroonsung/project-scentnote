import type { FamilyId } from '../../types'

/** 카드 면 표시(CARD FRONT / CARD BACK): 앞면·뒷면이 같은 크기·색·위치로 쓴다 */
export default function FaceLabel({ family, children }: { family: FamilyId; children: string }) {
  return (
    <span
      className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold tracking-[0.275px] text-ink"
      style={{
        background: `color-mix(in srgb, var(--${family}), white 40%)`,
        borderColor: `color-mix(in srgb, var(--${family}), var(--ink) 25%)`,
      }}
    >
      {children}
    </span>
  )
}
