import arrowRight from '../../assets/icons/select/arrow-right.svg'
import block from '../../assets/icons/select/block.svg'
import giftBox from '../../assets/icons/gift/gift-box.svg'
import { AVOID_HINT, FAMILY_PHRASE } from '../../lib/labels'
import { avoidedCount, chosenFamilies } from '../../lib/avoid'
import { CHIPS, PERFUMES } from '../../lib/perfumes'
import type { FamilyId, Selection } from '../../types'
import EditButton from './EditButton'

interface Props {
  step: 1 | 2
  selection: Selection
  /** 호불호 적은 향수 수 / 전체 향수 수 */
  lowCount: number
  totalCount: number
  canNext: boolean
  hint: string
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  /** 분위기 고르기(1단계)로 돌아가 고친다 */
  onEditMood: () => void
  onRestart: () => void
  onSwitchToSelf: () => void
}

const label = 'font-mono text-[11px] uppercase tracking-[0.55px] text-slate'

export default function GiftPanel(p: Props) {
  const { step, selection } = p
  const moods = selection.moods.map((id) => CHIPS.moods.find((m) => m.id === id)).filter((m) => !!m)
  const avoids = selection.avoids.map((id) => CHIPS.avoids.find((a) => a.id === id)).filter((a) => !!a)
  // 고른 분위기와 연결된 향 계열 (겹치는 것은 한 번만, 최대 3개)
  const families: FamilyId[] = []
  moods.forEach((m) => m.affinity.forEach((f) => !families.includes(f as FamilyId) && families.push(f as FamilyId)))
  const hasMood = moods.length > 0 || selection.unsure
  const ratio = p.totalCount ? Math.round((p.lowCount / p.totalCount) * 100) : 0

  return (
    <aside className="flex flex-col rounded-card bg-card p-7 shadow-float" aria-label="선물 취향 노트">
      <div className="flex items-start justify-between gap-2 pb-6">
        <div>
          <h2 className="pt-1 text-2xl font-medium leading-[34px] tracking-[-0.36px] text-ink">선물 취향 노트</h2>
        </div>
        <span className="rounded-full bg-powdery-tint px-2.5 py-1 font-mono text-[13px] font-bold tracking-[0.65px] text-powdery-deep">GIFT MODE</span>
      </div>

      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2.5 rounded-xl bg-mist p-4">
          <div className="flex items-center justify-between">
            <span className={`${label} font-bold`}>INDEX 01 · 받는 사람 분위기</span>
            <span className="flex items-center gap-2">
              {step === 2 && <EditButton onClick={p.onEditMood} label="받는 사람 분위기 고르기로 돌아가 고치기" />}
              <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-bold leading-[11px] tracking-[0.55px] ${hasMood ? 'bg-powdery-tint text-ink' : 'bg-line/60 text-slate'}`}>
                {hasMood ? 'RECORDED' : 'PENDING'}
              </span>
            </span>
          </div>
          {!hasMood ? (
            <p className="text-sm text-slate/70">아직 고르지 않았어요</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5 pt-1">
              {selection.unsure ? (
                <li className="rounded-full bg-ink px-3 py-1 text-sm text-white">잘 모르겠어요 · 호불호 적은 향</li>
              ) : (
                moods.map((m) => (
                  <li key={m.id} className="rounded-full bg-ink px-3 py-1 text-sm text-white">
                    {m.label}
                  </li>
                ))
              )}
            </ul>
          )}
          {families.length > 0 && !selection.unsure && (
            <p className="pt-1 text-[11px] leading-4 tracking-[0.55px] text-slate">
              먼저 살펴볼 향: {families.slice(0, 3).map((f) => FAMILY_PHRASE[f]).join(' · ')}
            </p>
          )}
        </section>

        {step === 1 ? (
          <section className="flex flex-col gap-3 rounded-xl bg-mist p-4">
            <span className={`${label} font-bold`}>INDEX 02 · 안전 추천 로직</span>
            <p className="text-sm leading-[22.75px] text-ink">
              선물 모드에서는 <b className="font-normal">호불호가 적은 향</b>에 점수를 더하고, 호불호가 갈리는 향은 점수를 낮춰서 골라요.
            </p>
            <div className="flex flex-col gap-1 pt-2">
              <div className="flex justify-between text-[11px] tracking-[0.55px] text-slate">
                <span>호불호 적은 향</span>
                <span className="text-ink">
                  {p.lowCount}개 / 전체 {p.totalCount}개
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-line" role="img" aria-label={`전체 향수의 ${ratio}%가 호불호 적은 향이에요`}>
                <div className="h-full rounded-full bg-ink" style={{ width: `${ratio}%` }} />
              </div>
            </div>
          </section>
        ) : (
          <section className="flex flex-col gap-1 rounded-xl bg-mist p-4">
            <span className={`${label} font-bold`}>INDEX 02 · 피하고 싶은 느낌 (EXCLUDED)</span>
            {avoids.length === 0 ? (
              <p className="pt-1 text-sm text-slate">아직 고르지 않았어요 · 없으면 건너뛰어도 돼요</p>
            ) : (
              <ul className="flex flex-col gap-1.5 pt-1">
                {avoids.map((a) => (
                  <li key={a.id} className="flex w-fit max-w-full flex-wrap items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                    <img src={block} alt="" width={11.67} height={11.67} />
                    {a.label}
                    <span className="text-[11px] tracking-[0.55px] text-slate">({AVOID_HINT[a.id]} · {avoidedCount(PERFUMES, a.id, chosenFamilies(selection.objects))}종)</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="flex gap-3 rounded-xl bg-mist p-3.5">
          <img src={giftBox} alt="" width={16.67} height={17.83} className="mt-0.5 h-[17.83px] shrink-0" />
          <p className="text-sm leading-[19.25px] text-slate">
            받는 분의 취향을 모르면 '잘 모르겠어요'를 골라도 괜찮아요. 결과에서는 매장에서 맡아볼 순서와 매장 찾기를 함께 알려 드려요.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-8">
        <div className="flex gap-3 pt-6">
          <button type="button" onClick={p.onBack} className="h-[52px] rounded-btn border border-line bg-card px-5 text-base tracking-[-0.08px] text-ink hover:bg-mist">
            이전
          </button>
          {step === 2 && (
            <button type="button" onClick={p.onSkip} className="h-[52px] flex-1 rounded-btn bg-mist text-base tracking-[-0.08px] text-ink hover:bg-line/50">
              건너뛰기
            </button>
          )}
          <button
            type="button"
            disabled={!p.canNext}
            onClick={p.onNext}
            className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-btn bg-ink text-base text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-ink-deep disabled:cursor-not-allowed disabled:bg-hint"
          >
            {step === 1 ? '다음 (02 피하고 싶은 느낌)' : '시향 후보 보기'}
            <img src={arrowRight} alt="" width={12} height={12} />
          </button>
        </div>
        {!p.canNext && <p className="text-center text-xs text-slate">{p.hint}</p>}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1 text-[11px] tracking-[0.55px] text-slate">
          <button type="button" onClick={p.onRestart} className="min-h-8 underline decoration-line">
            선택 초기화
          </button>
          <span className="text-line" aria-hidden="true">·</span>
          <button type="button" onClick={p.onSwitchToSelf} className="min-h-8">
            나를 위한 향수 찾기로 전환 →
          </button>
        </div>
      </div>
    </aside>
  )
}
