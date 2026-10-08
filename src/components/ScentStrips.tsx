import { FAMILIES } from '../lib/perfumes'
import type { FamilyId } from '../types'

/** 향 계열 14개를 시향지 띠로 보여준다. 높이는 디자인(Figma)의 제각각인 높이를 따른다. */
const STRIP: Record<FamilyId, { height: number; label: string }> = {
  citrus: { height: 250, label: '시트러스' },
  fruity: { height: 220, label: '프루티' },
  aqua: { height: 200, label: '아쿠아' },
  green: { height: 215, label: '그린' },
  aromatic: { height: 230, label: '아로마틱' },
  floral: { height: 265, label: '플로럴' },
  whiteFloral: { height: 225, label: '하얀 꽃' },
  powdery: { height: 195, label: '파우더리' },
  musk: { height: 190, label: '머스크' },
  spicy: { height: 210, label: '스파이시' },
  woody: { height: 280, label: '우디' },
  amber: { height: 205, label: '앰버' },
  gourmand: { height: 235, label: '구르망' },
  leather: { height: 245, label: '레더' },
}

export default function ScentStrips() {
  return (
    <div className="flex h-[340px] items-end gap-1.5 px-1 pt-8" role="img" aria-label="14개 향 계열 시향지 띠">
      {FAMILIES.map((f) => {
        const s = STRIP[f.id]
        return (
          <div key={f.id} className="relative flex min-w-0 flex-1 flex-col items-center">
            <div
              className="flex w-full flex-col items-center justify-between rounded-t-md px-0.5 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
              style={{ height: s.height, background: `var(--${f.id}-tint)` }}
            >
              <span className="h-1 w-full rounded-full" style={{ background: `var(--${f.id})` }} />
              <span
                className="text-[10px] tracking-[-0.08px] text-slate opacity-80 [writing-mode:vertical-rl] [text-orientation:upright]"
              >
                {s.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
