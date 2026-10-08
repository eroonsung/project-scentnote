import { useState } from 'react'
import { MOOD_EXAMPLES } from '../../lib/labels'
import { CHIPS } from '../../lib/perfumes'
import InfoSheet from '../InfoSheet'

/** "분위기 예시 보기" 버튼과 팝업. 분위기 칩 13개를 일상 장면 예시로 한눈에 보여 준다 */
export default function MoodExamples({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={`inline-flex h-10 w-fit items-center gap-1.5 rounded-lg bg-ink px-4 text-sm text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-ink-deep ${className}`}
      >
        분위기 예시 보기 <span aria-hidden="true" className="text-[13px]">→</span>
      </button>
      {open && (
        <InfoSheet title="분위기 예시" eyebrow="MOOD EXAMPLES" onClose={() => setOpen(false)}>
          <p className="pb-4 text-sm leading-[22px] text-slate">고르기 어려울 땐, 떠오르는 장면에 가까운 분위기를 골라 보세요.</p>
          <ul className="flex flex-col divide-y divide-line/60">
            {CHIPS.moods.map((m) => (
              <li key={m.id} className="flex items-baseline gap-4 py-3">
                <b className="w-20 shrink-0 text-sm font-medium text-ink">{m.label}</b>
                <span className="text-sm leading-[22px] text-slate">{MOOD_EXAMPLES[m.id]?.join(' · ')}</span>
              </li>
            ))}
          </ul>
        </InfoSheet>
      )}
    </>
  )
}
