import type { CSSProperties, Ref } from 'react'
import checkpoint from '../../assets/icons/result/checkpoint.svg'
import flipBack from '../../assets/icons/result/flip-back.svg'
import memoIcon from '../../assets/icons/result/memo.svg'
import storeIcon from '../../assets/icons/result/store.svg'
import { naverMapSearchUrl } from '../../lib/links'
import type { Perfume } from '../../types'
import { INTENSITY_KO, POLARIZING_KO, tiersOf } from './noteInfo'

interface Props {
  className: string
  style: CSSProperties
  hidden: boolean
  index: number
  total: number
  perfume: Perfume
  hasMemo: boolean
  titleRef: Ref<HTMLHeadingElement>
  onMemo: () => void
  onFlipBack: () => void
}

const chip = 'rounded-full border border-line/40 bg-card/90 px-[11px] py-[5px] text-[11px] leading-4 tracking-[0.55px] text-ink'

/** 카드 뒷면: 시향 가이드 (노트 3단, 잔향, 강도, 호불호, 체크 포인트, 매장 찾기·메모) */
export default function CardBack({ className, style, hidden, index, total, perfume: p, hasMemo, titleRef, onMemo, onFlipBack }: Props) {
  const no = String(index + 1).padStart(2, '0')
  return (
    <div className={className} style={style} inert={hidden} aria-hidden={hidden}>
      <div className="flex flex-col gap-2 border-b border-line/40 pb-[13px]">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] leading-4 tracking-[0.55px] text-slate">
            INDEX {index + 1}/{total} · SCENT ARCHIVE DOSSIER
          </span>
          <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 font-mono text-[11px] font-bold tracking-[0.275px] text-paper">CARD BACK</span>
        </div>
        <div className="flex items-start justify-between gap-2 pt-1">
          <div>
            <h2 ref={titleRef} tabIndex={-1} className="text-lg font-bold leading-[26px] tracking-[-0.18px] text-ink outline-none">
              {no} · {p.nameKo}
            </h2>
            <p className="font-mono text-[11px] leading-4 tracking-[0.55px] text-slate">
              {p.brandKo} ({p.brand} · {p.name})
            </p>
          </div>
          {p.concentration && <span className="font-mono text-[13px] font-bold tracking-[1.04px] text-ink">{p.concentration}</span>}
        </div>
      </div>

      <ul className="flex flex-col gap-2.5 pt-3">
        {tiersOf(p).map((t) => (
          <li key={t.key} className="flex flex-col gap-1 rounded-xl border border-line/40 bg-card/90 p-[11px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold leading-4 tracking-[0.55px] text-ink">
                <span className="size-2 rounded-full" style={{ background: `var(--${t.family})` }} aria-hidden="true" />
                {t.title}
              </span>
              <span className="text-[10px] text-hint">{t.hint}</span>
            </div>
            {t.notes.length === 0 ? (
              <p className="pl-3.5 text-sm leading-[22px] text-slate">[확인 필요]</p>
            ) : (
              t.notes.slice(0, 2).map((n) => (
                <p key={n.en} className="pl-3.5 text-sm leading-[22px] text-ink">
                  {n.ko} · {n.feel}
                </p>
              ))
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 pt-3">
        <p className="pl-1 text-sm leading-[22px] text-ink">"{p.drydown}"</p>
        <ul className="flex flex-wrap gap-2">
          <li className={`${chip} font-mono`}>{[p.concentration, INTENSITY_KO[p.intensity]].filter(Boolean).join(' · ')}</li>
          <li className={chip}>{POLARIZING_KO[p.polarizing]}</li>
          <li className={chip}>{p.seasonOccasion}</li>
        </ul>
      </div>

      <div
        className="mt-3 flex items-center gap-2 rounded-xl border bg-paper/80 p-[11px]"
        style={{ borderColor: `color-mix(in srgb, var(--${p.family}), transparent 40%)` }}
      >
        <img src={checkpoint} alt="" width={16.5} height={15.75} className="shrink-0" />
        <p className="text-[13px] leading-[17.88px] tracking-[-0.08px] text-ink">{p.checkPoint}</p>
      </div>

      {p.channels.length > 0 && (
        <p className="pt-2.5 text-[11px] leading-4 tracking-[0.55px] text-slate">
          <b className="font-normal text-ink">시향 가능한 곳</b> · {p.channels.join(' · ')}
          <span className="block text-hint">브랜드 기준이에요. 가기 전에 매장에 재고를 확인해 보세요.</span>
        </p>
      )}

      <div className="flex flex-col gap-2 pt-4">
        <div className="flex gap-2">
          <a
            href={naverMapSearchUrl(p.storeQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl border border-line bg-card/60 text-[13px] tracking-[-0.08px] text-ink hover:bg-card"
          >
            <img src={storeIcon} alt="" width={12} height={10.67} />
            매장 찾기
          </a>
          <button
            type="button"
            onClick={onMemo}
            className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-ink text-[13px] tracking-[-0.08px] text-paper hover:bg-ink-deep"
          >
            <img src={memoIcon} alt="" width={12} height={10.67} />
            {hasMemo ? '메모 수정하기' : '메모 남기기'}
          </button>
        </div>
        <button type="button" onClick={onFlipBack} className="flex min-h-9 items-center justify-center gap-1 text-[13px] tracking-[-0.08px] text-slate">
          앞면 보기 <img src={flipBack} alt="" width={10} height={10} />
        </button>
      </div>
    </div>
  )
}
