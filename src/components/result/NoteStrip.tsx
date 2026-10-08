import { useId, useState } from 'react'
import type { Perfume } from '../../types'
import { tiersOf, type TierInfo } from './noteInfo'

/** 탑·미들·베이스 노트를 색 막대로 보여주고, 막대(또는 아래 글자)에 올리거나 누르면 그 단계의 노트를 말풍선으로 보여준다 */
export default function NoteStrip({ perfume: p }: { perfume: Perfume }) {
  const tiers = tiersOf(p)
  const [active, setActive] = useState<TierInfo['key'] | null>(null)
  const id = useId()
  const current = tiers.find((t) => t.key === active)

  const color = (t: TierInfo, i: number) =>
    i === 0 ? `color-mix(in srgb, var(--${t.family}), white 35%)` : i === 2 ? `color-mix(in srgb, var(--${t.family}), var(--ink) 20%)` : `var(--${t.family})`

  return (
    <div className="relative flex flex-col gap-1.5" onMouseLeave={() => setActive(null)}>
      <div className="flex h-6 overflow-hidden rounded-full bg-line" role="group" aria-label="노트 색 막대 (올리거나 누르면 탑·미들·베이스 노트가 보여요)">
        {tiers.map((t, i) => (
          <button
            key={t.key}
            type="button"
            aria-expanded={active === t.key}
            aria-controls={`${id}-tip`}
            aria-label={`${t.title} 노트 보기`}
            onMouseEnter={() => setActive(t.key)}
            onFocus={() => setActive(t.key)}
            onBlur={() => setActive(null)}
            onClick={() => setActive((a) => (a === t.key ? null : t.key))}
            className="h-full flex-1 cursor-pointer transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
            style={{ background: color(t, i) }}
          />
        ))}
      </div>
      <div className="flex justify-between gap-2 px-0.5 font-mono text-[11px] tracking-[0.55px] text-slate">
        {tiers.map((t) => (
          <span key={t.key} className="min-w-0 truncate">
            {t.short} {t.notes[0]?.ko ?? '-'}
          </span>
        ))}
      </div>
      {current && (
        <div
          id={`${id}-tip`}
          role="tooltip"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-xl border border-line bg-card p-3.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.25)]"
        >
          <p className="flex items-center gap-1.5 pb-1.5 font-mono text-[11px] font-bold leading-4 tracking-[0.55px] text-ink">
            <span className="size-2 rounded-full" style={{ background: `var(--${current.family})` }} aria-hidden="true" />
            {current.title}
            <span className="font-sans text-[10px] font-normal text-hint">{current.hint}</span>
          </p>
          {current.notes.length === 0 ? (
            <p className="text-sm leading-[22px] text-slate">[확인 필요]</p>
          ) : (
            current.notes.map((n) => (
              <p key={n.en} className="text-sm leading-[22px] text-ink">
                <b className="font-semibold">{n.ko}</b> · {n.feel}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  )
}
