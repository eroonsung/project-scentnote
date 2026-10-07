import { FAMILIES } from '../lib/perfumes'
import type { FamilyId } from '../types'

/** 향 계열 14개를 시향지 띠로 보여준다. 높이는 디자인(Figma)의 제각각인 높이를 따른다. */
const STRIP: Record<FamilyId, { height: number; label: string }> = {
  citrus: { height: 250, label: 'CITRUS' },
  fruity: { height: 220, label: 'FRUITY' },
  aqua: { height: 200, label: 'AQUA' },
  green: { height: 215, label: 'GREEN' },
  aromatic: { height: 230, label: 'AROMA' },
  floral: { height: 265, label: 'FLORAL' },
  whiteFloral: { height: 225, label: 'W.FLORAL' },
  powdery: { height: 195, label: 'POWDER' },
  musk: { height: 190, label: 'MUSK' },
  spicy: { height: 210, label: 'SPICY' },
  woody: { height: 280, label: 'WOODY' },
  amber: { height: 205, label: 'AMBER' },
  gourmand: { height: 235, label: 'GOURM.' },
  leather: { height: 245, label: 'LEATHER' },
}

/** 예시 시향 순서: 가벼운 향 → 진한 향 */
const ACTIVE: Partial<Record<FamilyId, string>> = { citrus: '01', floral: '02', woody: '03' }

export default function ScentStrips() {
  return (
    <div className="flex h-[340px] items-end gap-1.5 px-1 pt-8" role="img" aria-label="14개 향 계열 시향지 띠">
      {FAMILIES.map((f) => {
        const s = STRIP[f.id]
        const seq = ACTIVE[f.id]
        return (
          <div key={f.id} className="relative flex min-w-0 flex-1 flex-col items-center">
            {seq && (
              <span className="absolute -top-7 rounded bg-ink px-1.5 py-0.5 font-mono text-[11px] font-bold leading-4 tracking-[0.55px] text-white shadow-float">
                {seq}
              </span>
            )}
            <div
              className="flex w-full flex-col items-center justify-between rounded-t-md px-0.5 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
              style={{ height: s.height, background: `var(--${f.id}-tint)` }}
            >
              <span className="h-1 w-full rounded-full" style={{ background: `var(--${f.id})` }} />
              <span
                className={`font-mono text-[10px] tracking-[-0.08px] [writing-mode:vertical-rl] rotate-180 ${
                  seq ? 'font-bold text-ink' : 'text-slate opacity-80'
                }`}
              >
                {s.label}
              </span>
              <span className="font-mono text-[9px] text-hint">#{String(f.order).padStart(2, '0')}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
