import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import close from '../assets/icons/result/close.svg'

interface Props {
  title: string
  /** 제목 위에 작게 보이는 영문 라벨 */
  eyebrow?: string
  onClose: () => void
  children: ReactNode
}

/** 읽기 전용 안내 팝업: 모바일은 아래 시트, 데스크톱은 가운데 팝업. Esc·바깥 클릭·닫기 버튼으로 닫는다 */
export default function InfoSheet({ title, eyebrow, onClose, children }: Props) {
  const dialog = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const opener = useRef<Element | null>(null)

  useEffect(() => {
    opener.current = document.activeElement
    // 입력칸이 있으면 첫 입력칸에, 없으면 닫기 버튼에 포커스
    const first = dialog.current?.querySelector<HTMLElement>('input')
    ;(first ?? closeBtn.current)?.focus()
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
    const items = dialog.current?.querySelectorAll<HTMLElement>('button, input')
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

  // 헤더처럼 backdrop-filter가 걸린 부모 안에서는 fixed가 부모 크기에 갇혀 잘리므로, 팝업은 body에 직접 그린다
  return createPortal(
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-ink-deep/45 p-0 backdrop-blur-[3px] md:items-center md:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={onKeyDown}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-title"
        className="flex max-h-[85vh] w-full max-w-[560px] flex-col rounded-t-sheet bg-card p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] md:rounded-sheet md:p-8"
      >
        <div className="flex items-start justify-between gap-4 pb-4">
          <div className="flex flex-col gap-1">
            {eyebrow && <p className="font-mono text-[11px] uppercase leading-4 tracking-[1.1px] text-slate">{eyebrow}</p>}
            <h2 id="info-title" className="text-2xl font-bold leading-[34px] tracking-[-0.6px] text-ink">
              {title}
            </h2>
          </div>
          <button ref={closeBtn} type="button" onClick={onClose} aria-label="닫기" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mist hover:bg-line/60">
            <img src={close} alt="" width={11.67} height={11.67} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        <button type="button" onClick={onClose} className="mt-6 h-[50px] w-full shrink-0 rounded-xl bg-mist text-sm text-ink hover:bg-line/50">
          닫기
        </button>
      </div>
    </div>,
    document.body,
  )
}
