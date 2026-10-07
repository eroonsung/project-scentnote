import { useRef, useState } from 'react'
import flipIcon from '../../assets/icons/result/flip.svg'
import storeIcon from '../../assets/icons/result/store.svg'
import { naverMapSearchUrl } from '../../lib/links'
import { getFamily, imageSrc, placeholderSrc } from '../../lib/perfumes'
import { formatPrice } from '../../lib/price'
import type { Recommendation } from '../../lib/recommend'
import type { Perfume } from '../../types'
import CardBack from './CardBack'
import { tiersOf } from './noteInfo'

interface Props {
  index: number
  total: number
  rec: Recommendation
  hasMemo: boolean
  /** 선물 모드: 호불호 적은 향이면 앞면에 배지를 보여준다 */
  gift?: boolean
  onMemo: (p: Perfume) => void
}

export default function ScentCard({ index, total, rec, hasMemo, gift, onMemo }: Props) {
  const p = rec.perfume
  const [flipped, setFlipped] = useState(false)
  const frontTitle = useRef<HTMLHeadingElement>(null)
  const backTitle = useRef<HTMLHeadingElement>(null)
  const family = getFamily(p.family)
  const no = String(index + 1).padStart(2, '0')
  const price = formatPrice(p)

  const flip = (to: boolean) => {
    setFlipped(to)
    // 뒤집은 뒤 포커스는 보이는 면의 제목으로
    window.setTimeout(() => (to ? backTitle : frontTitle).current?.focus({ preventScroll: true }), 50)
  }

  const face = 'col-start-1 row-start-1 flex min-h-[580px] flex-col rounded-card border p-[25px] [backface-visibility:hidden]'
  const faceStyle = {
    background: `var(--${p.family}-tint)`,
    borderColor: `color-mix(in srgb, var(--${p.family}), transparent 55%)`,
  }

  return (
    <article className="flex-1 [perspective:1400px]" aria-label={`${no}번 시향 후보 ${p.brandKo} ${p.nameKo}`}>
      <div
        className="grid h-full grid-rows-1 transition-transform duration-[400ms] ease-out [transform-style:preserve-3d]"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}
      >
        {/* 앞면 */}
        <div className={face} style={faceStyle} inert={flipped} aria-hidden={flipped}>
          <div className="flex items-center justify-between">
            <span className="flex size-8 items-center justify-center rounded-full bg-ink font-mono text-[11px] font-bold text-white">{no}</span>
            <span className="font-mono text-[11px] tracking-[0.55px] text-slate">INDEX {index + 1}/{total}</span>
          </div>

          {/* 가운데 내용 3덩어리는 간격을 고정해 세로 가운데로 모은다 (카드마다 간격이 같다) */}
          <div className="flex flex-1 flex-col justify-center gap-5">
          <div className="flex flex-col items-center">
            <div className="flex h-72 w-[216px] items-center justify-center overflow-hidden rounded-xl bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <PerfumeImage perfume={p} />
            </div>
            <span
              className="mt-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-sm text-ink"
              style={{ background: `color-mix(in srgb, var(--${p.family}), transparent 75%)` }}
            >
              <span className="size-1.5 rounded-full" style={{ background: `var(--${p.family})` }} aria-hidden="true" />
              {family?.name}
            </span>
            {gift && p.polarizing === 'low' && (
              <span className="mt-1.5 rounded-full border border-line/60 bg-card/80 px-2.5 py-0.5 text-[11px] tracking-[0.55px] text-ink">호불호 적음</span>
            )}
            <h2
              ref={frontTitle}
              tabIndex={-1}
              className="mt-2 min-h-[52px] text-center text-lg font-medium leading-[26px] tracking-[-0.18px] text-ink outline-none"
            >
              {p.brandKo} · {p.nameKo}
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex h-6 overflow-hidden rounded-full bg-line" role="img" aria-label="탑·미들·베이스 노트 색">
              {tiersOf(p).map((t, i) => (
                <span
                  key={t.key}
                  className="h-full flex-1"
                  style={{
                    background:
                      i === 0
                        ? `color-mix(in srgb, var(--${t.family}), white 35%)`
                        : i === 2
                          ? `color-mix(in srgb, var(--${t.family}), var(--ink) 20%)`
                          : `var(--${t.family})`,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between gap-2 px-0.5 font-mono text-[11px] tracking-[0.55px] text-slate">
              {tiersOf(p).map((t) => (
                <span key={t.key} className="min-w-0 truncate">
                  {t.short} {t.notes[0]?.ko ?? '-'}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="min-h-[39px] text-sm leading-[19.25px] text-ink">"{p.summary}"</p>
            {rec.reasons.length > 0 && (
              <p className="rounded-lg bg-paper/70 px-2.5 py-2.5 text-[13px] leading-[21px] tracking-[-0.08px] text-ink">
                추천 이유 <span className="text-slate">· {rec.reasons.join(' + ')}</span>
              </p>
            )}
          </div>

          <div className="flex items-baseline justify-between gap-2 border-t border-line/40 pt-3">
            <span className={`${price.hasPrice ? 'font-mono font-bold' : ''} text-[11px] tracking-[0.55px] text-ink`}>{price.main}</span>
            {price.note && <span className="font-mono text-[10px] text-slate">{price.note}</span>}
          </div>
          </div>

          <a
            href={naverMapSearchUrl(p.storeQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex h-10 items-center justify-center gap-1.5 rounded-xl border border-ink/20 text-[13px] tracking-[-0.08px] text-ink hover:bg-card/60"
          >
            <img src={storeIcon} alt="" width={12} height={10.67} />
            매장 찾기
          </a>
          <button
            type="button"
            onClick={() => flip(true)}
            className="mt-2 flex h-11 items-center justify-center gap-1.5 rounded-xl bg-card/90 text-sm text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-card"
          >
            노트·시향 팁 보기 <img src={flipIcon} alt="" width={10.67} height={10.67} />
          </button>
        </div>

        {/* 뒷면 */}
        <CardBack
          className={`${face} justify-between [transform:rotateY(180deg)]`}
          style={faceStyle}
          hidden={!flipped}
          index={index}
          total={total}
          perfume={p}
          hasMemo={hasMemo}
          titleRef={backTitle}
          onMemo={() => onMemo(p)}
          onFlipBack={() => flip(false)}
        />
      </div>
    </article>
  )
}

function PerfumeImage({ perfume }: { perfume: Perfume }) {
  const hasReal = !!perfume.image
  return (
    <img
      src={imageSrc(perfume)}
      alt={hasReal ? `${perfume.brandKo} ${perfume.nameKo} 병 이미지` : '향수병 이미지 준비 중'}
      loading="lazy"
      className={`size-full ${hasReal ? 'object-contain' : 'object-cover'}`}
      onError={(e) => {
        const img = e.currentTarget
        img.onerror = null
        img.src = placeholderSrc(perfume.family)
        img.alt = '향수병 이미지 준비 중'
        img.className = 'size-full object-cover'
      }}
    />
  )
}
