import { useRef, useState } from 'react'
import calendar from '../../assets/icons/notes/calendar.svg'
import memoPencil from '../../assets/icons/notes/memo-pencil.svg'
import starFilled from '../../assets/icons/notes/star-filled.svg'
import starOutline from '../../assets/icons/notes/star-outline.svg'
import trash from '../../assets/icons/notes/trash.svg'
import flipIcon from '../../assets/icons/result/flip.svg'
import flipBack from '../../assets/icons/result/flip-back.svg'
import { getFamily } from '../../lib/perfumes'
import type { Memo, Perfume } from '../../types'
import ConcentrationHint from '../result/ConcentrationHint'
import { INTENSITY_KO, POLARIZING_KO } from '../result/noteInfo'
import NoteStrip from '../result/NoteStrip'
import PerfumeImage from '../PerfumeImage'

interface Props {
  memo: Memo
  perfume: Perfume | undefined
  /** 오래된 순서대로 매긴 번호 (ARCHIVE · 001) */
  archiveNo: number
  onEdit: () => void
  onDelete: () => void
}

/** "2026-10-07T07:59:11Z" → "2026.10.07" */
function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function MemoCard({ memo, perfume: p, archiveNo, onEdit, onDelete }: Props) {
  const family = p ? getFamily(p.family) : undefined
  const [flipped, setFlipped] = useState(false)
  const card = useRef<HTMLElement>(null)
  const [everFlipped, setEverFlipped] = useState(false)

  const flip = (to: boolean) => {
    setEverFlipped(true)
    setFlipped(to)
    // 뒤집은 뒤 포커스는 보이는 면의 첫 버튼으로 (화면이 튀지 않게 스크롤 없이)
    window.setTimeout(() => card.current?.querySelector<HTMLElement>('[data-flip-focus]')?.focus({ preventScroll: true }), 60)
  }

  // 앞면과 뒷면을 같은 칸에 겹쳐 두어 카드 크기가 뒤집어도 같다 (안 보이는 면은 자리만 차지한다)
  const anim = everFlipped ? 'animate-flip-in' : ''

  return (
    <article ref={card} className="grid">
      <div
        className={`col-start-1 row-start-1 flex flex-col justify-between gap-11 rounded-xl border border-transparent bg-card p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)] ${flipped ? 'invisible' : anim}`}
        inert={flipped}
        aria-hidden={flipped}
      >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          {p ? (
            <span
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] leading-4 tracking-[0.55px]"
              style={{ background: `var(--${p.family}-tint)`, color: `var(--${p.family}-deep)` }}
            >
              <span className="size-2 rounded-full" style={{ background: `var(--${p.family})` }} aria-hidden="true" />
              {family?.name}
            </span>
          ) : (
            <span className="rounded-full bg-mist px-2.5 py-1 text-[11px] text-slate">[확인 필요]</span>
          )}
          <span className="font-mono text-[11px] tracking-[0.55px] text-slate">ARCHIVE · {String(archiveNo).padStart(3, '0')}</span>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase leading-4 tracking-[0.55px] text-slate">{p?.brand ?? '[확인 필요]'}</p>
          <h2 className="text-2xl font-medium leading-[34px] tracking-[-0.6px] text-ink">{p?.nameKo ?? '알 수 없는 향수'}</h2>
          {p && <p className="text-sm leading-[22px] text-slate">{[p.name, p.concentration].filter(Boolean).join(' · ')}</p>}
        </div>

        {p && <p className="text-sm leading-[22px] text-ink">"{p.summary}"</p>}

        <div className="flex items-center gap-2" role="img" aria-label={`별점 5점 만점에 ${memo.rating}점`}>
          <span className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <img key={n} src={n <= memo.rating ? starFilled : starOutline} alt="" width={15} height={14.25} />
            ))}
          </span>
          <span className="font-mono text-[11px] font-bold tracking-[0.55px] text-ink">{memo.rating.toFixed(1)}</span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg bg-mist p-4">
          <p className="flex items-center gap-1 text-[11px] leading-4 tracking-[0.55px] text-slate">
            <img src={memoPencil} alt="" width={10.5} height={9.33} />
            시향 한 줄 메모
          </p>
          {memo.text ? (
            <p className="text-base italic leading-[22px] tracking-[-0.08px] text-ink">"{memo.text}"</p>
          ) : (
            <p className="text-sm leading-[22px] text-hint">남긴 메모가 없어요</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between pt-4 [background:linear-gradient(90deg,transparent,color-mix(in_srgb,var(--line),transparent_60%),transparent)_top/100%_1px_no-repeat]">
          <p className="flex items-center gap-1 pt-6 font-mono text-[11px] leading-4 tracking-[0.55px] text-slate">
            <img src={calendar} alt="" width={11.25} height={12.5} />
            {formatDate(memo.createdAt)} 시향
          </p>
          <div className="flex items-center gap-3 pt-6">
            <button type="button" onClick={onEdit} disabled={!p} className="min-h-6 text-[11px] tracking-[0.55px] text-slate hover:text-ink disabled:opacity-40">
              수정
            </button>
            <span className="font-mono text-[11px] text-line" aria-hidden="true">·</span>
            <button type="button" onClick={onDelete} className="flex min-h-6 items-center gap-0.5 text-[11px] tracking-[0.55px] text-spicy-deep/80 hover:text-spicy-deep">
              <img src={trash} alt="" width={8.67} height={9.75} />
              삭제
            </button>
          </div>
        </div>
        {p && (
          <button
            type="button"
            data-flip-focus
            onClick={() => flip(true)}
            className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-line bg-card text-[13px] tracking-[-0.08px] text-ink hover:bg-mist"
          >
            향수 상세 정보 보기 <img src={flipIcon} alt="" width={10.67} height={10.67} />
          </button>
        )}
      </div>
      </div>
      {p && <DetailBack perfume={p} archiveNo={archiveNo} visible={flipped} className={anim} onFlipBack={() => flip(false)} />}
    </article>
  )
}

/** 카드 뒷면: 향수 이미지와 상세 정보 (노트 색 막대 — 올리면 탑·미들·베이스 노트, 잔향, 강도·호불호·계절) */
function DetailBack({ perfume: p, archiveNo, visible, className, onFlipBack }: { perfume: Perfume; archiveNo: number; visible: boolean; className: string; onFlipBack: () => void }) {
  const family = getFamily(p.family)
  const chip = 'rounded-full border border-line/40 bg-card/90 px-[11px] py-[5px] text-[11px] leading-4 tracking-[0.55px] text-ink'
  return (
    <div
      className={`col-start-1 row-start-1 flex flex-col justify-between gap-4 rounded-xl border p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)] ${visible ? className : 'invisible'}`}
      style={{ background: `var(--${p.family}-tint)`, borderColor: `color-mix(in srgb, var(--${p.family}), transparent 55%)` }}
      inert={!visible}
      aria-hidden={!visible}
      aria-label={`${p.brandKo} ${p.nameKo} 상세 정보`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-card/80 px-2.5 py-1 text-[11px] leading-4 tracking-[0.55px] text-ink">
          <span className="size-2 rounded-full" style={{ background: `var(--${p.family})` }} aria-hidden="true" />
          {family?.name}
        </span>
        <span className="font-mono text-[11px] tracking-[0.55px] text-slate">ARCHIVE · {String(archiveNo).padStart(3, '0')}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-[132px] w-[100px] shrink-0 overflow-hidden rounded-xl bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <PerfumeImage perfume={p} />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-mono text-[11px] uppercase leading-4 tracking-[0.55px] text-slate">{p.brand}</p>
          <h2 className="text-xl font-medium leading-7 tracking-[-0.4px] text-ink">{p.nameKo}</h2>
          <p className="text-sm leading-[22px] text-slate">{p.name}</p>
          {p.concentration && (
            <div className="relative mt-1 w-fit">
              <ConcentrationHint concentration={p.concentration} family={p.family} align="center" />
            </div>
          )}
        </div>
      </div>

      <NoteStrip perfume={p} />

      <div className="flex flex-col gap-2">
        <p className="pl-1 text-sm leading-[22px] text-ink">"{p.drydown}"</p>
        <ul className="flex flex-wrap gap-2">
          <li className={`${chip} font-mono`}>{[p.concentration, INTENSITY_KO[p.intensity]].filter(Boolean).join(' · ')}</li>
          <li className={chip}>{POLARIZING_KO[p.polarizing]}</li>
          <li className={chip}>{p.seasonOccasion}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <button type="button" data-flip-focus onClick={onFlipBack} className="flex min-h-10 items-center justify-center gap-1 rounded-xl bg-card/90 text-[13px] tracking-[-0.08px] text-ink hover:bg-card">
          내 메모 보기 <img src={flipBack} alt="" width={10} height={10} />
        </button>
      </div>
    </div>
  )
}
