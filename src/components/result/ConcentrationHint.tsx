import { useId, useState } from 'react'
import type { FamilyId } from '../../types'

const ROWS = [
  { key: 'parfum', name: '퍼퓸', en: 'Parfum', desc: '향료 비율이 가장 높아요', feel: '가장 진하고 오래 가는 편' },
  { key: 'edp', name: '오드퍼퓸', en: 'EDP', desc: '향료가 많은 편이에요', feel: '진하고 오래 가는 편' },
  { key: 'edt', name: '오드뚜왈렛', en: 'EDT', desc: '가볍게 뿌리기 좋아요', feel: '부드럽고 가벼운 편' },
  { key: 'edc', name: '오드코롱', en: 'EDC', desc: '향료가 가장 적어요', feel: '가장 가볍고 금방 날아가는 편' },
] as const

/** 데이터의 농도 표기를 표의 행으로 연결 (표에 없는 표기는 강조하지 않는다) */
function rowKey(concentration: string): string | null {
  const c = concentration.toLowerCase()
  if (c === 'parfum' || c === 'extrait') return 'parfum'
  if (c === 'edp') return 'edp'
  if (c === 'edt') return 'edt'
  if (c === 'edc' || c === 'cologne') return 'edc'
  return null
}

/** 카드 뒷면의 농도 버튼: 올려 두거나 누르면 농도 종류 표가 뜨고, 이 향수의 농도 행을 강조한다 */
export default function ConcentrationHint({
  concentration,
  family,
  align = 'right',
}: {
  concentration: string
  family: FamilyId
  /** right: 버튼 오른쪽 끝에 맞춰 왼쪽으로 펼침 / center: 가장 가까운 relative 부모의 가운데 아래로 펼침 */
  align?: 'right' | 'center'
}) {
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const id = useId()
  const open = hover || pinned
  const mine = rowKey(concentration)
  return (
    <span className={`shrink-0 ${align === 'right' ? 'relative' : ''}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setPinned((v) => !v)}
        onBlur={() => setPinned(false)}
        onKeyDown={(e) => e.key === 'Escape' && (setPinned(false), setHover(false))}
        className="flex h-7 items-center gap-1 rounded-lg bg-ink px-2.5 font-mono text-[13px] font-bold tracking-[1.04px] text-paper hover:bg-[color-mix(in_srgb,var(--ink),white_35%)]"
      >
        {concentration}
        <span aria-hidden="true" className="text-[11px] opacity-60">
          ?
        </span>
      </button>
      {open && (
        <div
          id={id}
          role="tooltip"
          className={`absolute top-[calc(100%+6px)] z-20 w-[min(272px,calc(100vw-64px))] rounded-xl border border-line bg-card p-3.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.25)] ${
            align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
          }`}
        >
          <p className="pb-2 text-xs font-medium text-ink">향수 농도 한눈에 보기</p>
          <ul className="flex flex-col gap-1">
            {ROWS.map((r) => {
              const on = r.key === mine
              return (
                <li
                  key={r.key}
                  className={`flex flex-col rounded-lg px-2.5 py-1.5 text-[12px] leading-[18px] ${on ? 'font-bold text-ink' : 'text-slate'}`}
                  style={on ? { background: `color-mix(in srgb, var(--${family}), white 55%)` } : undefined}
                >
                  <span>
                    {r.name} <span className="font-mono text-[11px]">({r.en})</span>
                  </span>
                  <span className={on ? 'font-medium' : ''}>
                    {r.desc} · {r.feel}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="pt-2 text-[11px] leading-4 text-hint">지속시간은 피부, 날씨, 뿌린 양에 따라 사람마다 달라요. 농도는 향료 비율이고, 향의 세기(강도)와는 따로 나눈 기준이에요.</p>
        </div>
      )}
    </span>
  )
}
