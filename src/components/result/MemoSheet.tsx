import { useEffect, useRef, useState } from 'react'
import clock from '../../assets/icons/result/clock.svg'
import close from '../../assets/icons/result/close.svg'
import save from '../../assets/icons/result/save.svg'
import starFilled from '../../assets/icons/result/star-filled.svg'
import starOutline from '../../assets/icons/result/star-outline.svg'
import type { Memo, Perfume } from '../../types'

const MAX = 100

interface Props {
  perfume: Perfume
  index: number
  existing?: Memo
  onSave: (rating: number, text: string) => void
  onClose: () => void
}

/** 시향 메모 팝업: 별점 1~5 + 한 줄 메모(최대 100자). 모바일은 아래 시트, 데스크톱은 가운데 팝업 */
export default function MemoSheet({ perfume: p, index, existing, onSave, onClose }: Props) {
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [text, setText] = useState(existing?.text ?? '')
  const firstStar = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const opener = useRef<Element | null>(null)

  useEffect(() => {
    opener.current = document.activeElement
    firstStar.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      if (opener.current instanceof HTMLElement) opener.current.focus()
    }
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key !== 'Tab') return
    // 팝업 안에서만 포커스가 돌도록
    const items = dialog.current?.querySelectorAll<HTMLElement>('button, textarea')
    if (!items || items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-ink-deep/45 p-0 backdrop-blur-[3px] md:items-center md:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={onKeyDown}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="memo-title"
        className="w-full max-w-[480px] rounded-t-sheet bg-card p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] md:rounded-sheet"
      >
        <div className="flex items-start justify-between pb-4">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase leading-4 tracking-[1.1px] text-slate">SCENT MEMO · QUICK LOG</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="size-2.5 rounded-full" style={{ background: `var(--${p.family})` }} aria-hidden="true" />
              <h2 id="memo-title" className="text-2xl font-bold leading-[34px] tracking-[-0.6px] text-ink">
                {String(index + 1).padStart(2, '0')} · {p.nameKo}
              </h2>
            </div>
            <p className="text-sm leading-[22px] text-slate">
              {p.brandKo} ({p.brand} · {p.name})
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="메모창 닫기" className="flex size-9 items-center justify-center rounded-full bg-mist hover:bg-line/60">
            <img src={close} alt="" width={11.67} height={11.67} />
          </button>
        </div>

        <fieldset className="flex flex-col gap-3 py-7">
          <div className="flex items-center justify-between">
            <legend className="text-xs tracking-[0.3px] text-ink">시향 만족도</legend>
            <span className="font-mono text-[11px] tracking-[0.55px] text-slate">{rating.toFixed(1)} / 5.0</span>
          </div>
          <div className="flex items-center gap-2.5" role="radiogroup" aria-label="만족도 5점 만점">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                ref={n === 1 ? firstStar : undefined}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n}점`}
                onClick={() => setRating(n)}
                className="flex min-h-11 min-w-9 items-center justify-center"
              >
                <img src={n <= rating ? starFilled : starOutline} alt="" width={21.67} height={20.58} />
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2 pt-3">
          <div className="flex items-center justify-between">
            <label htmlFor="memo-text" className="text-xs tracking-[0.48px] text-ink">
              한 줄 메모
            </label>
            <span className="font-mono text-[11px] tracking-[0.55px] text-slate">
              {text.length} / {MAX}
            </span>
          </div>
          <textarea
            id="memo-text"
            value={text}
            maxLength={MAX}
            onChange={(e) => setText(e.target.value)}
            placeholder="맡아본 느낌을 한 줄로 남겨 보세요"
            className="h-[88px] resize-none rounded-xl bg-mist p-3.5 text-sm leading-[22.75px] text-ink placeholder:text-hint"
          />
          <p className="flex items-center gap-1.5 pt-1 text-[11px] text-slate">
            <img src={clock} alt="" width={12.5} height={12.5} />
            곧 시간에 따라 바뀌는 잔향까지 기록할 수 있어요
          </p>
        </div>

        <div className="flex gap-3 pt-8">
          <button type="button" onClick={onClose} className="h-[50px] flex-1 rounded-xl bg-mist text-sm text-ink hover:bg-line/50">
            닫기
          </button>
          <button
            type="button"
            disabled={rating === 0}
            onClick={() => onSave(rating, text.trim())}
            className="flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink text-sm text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-ink-deep disabled:cursor-not-allowed disabled:bg-hint"
          >
            <img src={save} alt="" width={11.33} height={12.75} />
            저장
          </button>
        </div>
        {rating === 0 && <p className="pt-2 text-center text-xs text-slate">별점을 먼저 골라 주세요</p>}
      </div>
    </div>
  )
}
