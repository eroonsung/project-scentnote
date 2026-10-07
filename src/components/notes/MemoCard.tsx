import calendar from '../../assets/icons/notes/calendar.svg'
import memoPencil from '../../assets/icons/notes/memo-pencil.svg'
import starFilled from '../../assets/icons/notes/star-filled.svg'
import starOutline from '../../assets/icons/notes/star-outline.svg'
import trash from '../../assets/icons/notes/trash.svg'
import { getFamily } from '../../lib/perfumes'
import type { Memo, Perfume } from '../../types'

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
  return (
    <article className="flex flex-col justify-between gap-11 rounded-xl bg-card p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
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
            현장 테이스팅 메모
          </p>
          {memo.text ? (
            <p className="text-base italic leading-[22px] tracking-[-0.08px] text-ink">"{memo.text}"</p>
          ) : (
            <p className="text-sm leading-[22px] text-hint">남긴 메모가 없어요</p>
          )}
        </div>
      </div>

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
    </article>
  )
}
