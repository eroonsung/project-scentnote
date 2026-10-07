import arrowRight from '../../assets/icons/select/arrow-right.svg'
import block from '../../assets/icons/select/block.svg'
import checkDone from '../../assets/icons/select/check-done.svg'
import hourglass from '../../assets/icons/select/hourglass.svg'
import indexCheck from '../../assets/icons/select/index-check.svg'
import predict from '../../assets/icons/select/predict.svg'
import restart from '../../assets/icons/select/restart.svg'
import sequence from '../../assets/icons/select/sequence.svg'
import xSmall from '../../assets/icons/select/x-small.svg'
import { AVOID_HINT, FAMILY_EN, FAMILY_PHRASE, TIER_LABELS } from '../../lib/labels'
import { CHIPS } from '../../lib/perfumes'
import type { CandidateCount } from '../../lib/recommend'
import type { FamilyId, Selection } from '../../types'

interface Props {
  step: 1 | 2 | 3
  selection: Selection
  candidates: CandidateCount
  nextLabel: string
  canNext: boolean
  hint: string
  onNext: () => void
  onBack?: () => void
  onSkip?: () => void
  onRestart: () => void
  onRemoveMood: (id: string) => void
}

const label = 'font-mono text-[11px] uppercase tracking-[0.55px] text-slate'
const box = 'rounded-xl border border-line/40 p-[15px]'

export default function TastePanel(p: Props) {
  const { step, selection } = p
  const moods = selection.moods.map((id) => CHIPS.moods.find((m) => m.id === id)).filter((m) => !!m)
  const objects = selection.objects.map((id) => CHIPS.objects.find((o) => o.id === id)).filter((o) => !!o)
  const avoids = selection.avoids.map((id) => CHIPS.avoids.find((a) => a.id === id)).filter((a) => !!a)
  const families = objects.map((o) => o.family as FamilyId)
  const count = step === 1 ? moods.length : step === 2 ? objects.length : avoids.length

  return (
    <aside className="flex flex-col gap-5 rounded-card border border-line bg-card p-[25px] shadow-float" aria-label="내 취향 노트">
      <div className="flex items-start justify-between gap-2 border-b border-line pb-4">
        <div>
          <h2 className="pt-0.5 text-lg font-medium leading-[26px] tracking-[-0.45px] text-ink">내 취향 노트</h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-powdery-tint px-3 py-1 font-mono text-[11px] font-bold tracking-[0.55px] text-powdery-deep">
          <span className="size-1.5 rounded-full bg-ink" aria-hidden="true" />
          {step === 3 ? `선택 ${count}개` : `선택 ${count} / 3`}
        </span>
      </div>

      {/* INDEX 01 분위기 */}
      <section className={`${box} flex flex-col gap-2 bg-mist/60`}>
        <div className="flex items-center justify-between">
          <span className={label}>INDEX 01 · 분위기</span>
          {step === 1 && <b className="font-mono text-[11px] tracking-[0.55px] text-ink">{moods.length ? 'RECORDED' : 'ACTIVE'}</b>}
          {step > 1 && <img src={indexCheck} alt="" width={9.5} height={7} />}
        </div>
        {moods.length === 0 ? (
          <p className="text-sm text-slate/70">아직 고르지 않았어요</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {moods.map((m) =>
              step === 1 ? (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => p.onRemoveMood(m.id)}
                    aria-label={`${m.label} 선택 해제`}
                    className="flex min-h-8 items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-sm text-white"
                  >
                    {m.label}
                    <img src={xSmall} alt="" width={7.58} height={7.58} />
                  </button>
                </li>
              ) : (
                <li key={m.id} className="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-sm text-ink">
                  <span className="size-1.5 rounded-full bg-slate" aria-hidden="true" />
                  {m.label}
                </li>
              ),
            )}
          </ul>
        )}
      </section>

      {/* INDEX 02 향기 */}
      {step === 1 ? (
        <Pending title="INDEX 02 · 선호 향기" text="아직 고르지 않았어요" badge="PENDING" />
      ) : (
        <section className={`${box} flex flex-col gap-2.5 bg-card`}>
          <div className="flex items-center justify-between">
            <span className={`${label} ${step === 2 ? 'font-bold text-ink' : ''}`}>INDEX 02 · 선호 향기{step === 2 ? ' (RECORDED)' : ''}</span>
            <span className={label}>{objects.length} ITEMS</span>
          </div>
          {objects.length === 0 ? (
            <p className="text-sm text-slate/70">아직 고르지 않았어요</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {objects.map((o, i) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between rounded-lg border p-[11px]"
                  style={{ background: `color-mix(in srgb, var(--${o.family}-tint) 70%, transparent)`, borderColor: `color-mix(in srgb, var(--${o.family}), transparent 60%)` }}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="size-2.5 rounded-full" style={{ background: `var(--${o.family})` }} aria-hidden="true" />
                    <span className="text-sm text-ink">{o.label}</span>
                    <span className="font-mono text-[11px] tracking-[0.55px] text-slate">{FAMILY_EN[o.family as FamilyId]} Note</span>
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.55px] text-slate">{TIER_LABELS[i]}</span>
                </li>
              ))}
            </ul>
          )}
          {families.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl border border-line bg-mist p-[15px]">
              <div className="flex items-center justify-between">
                <span className={label}>{families.length}-COLOR SCENT ACCORD STRIP</span>
                <span className={label}>HARMONY</span>
              </div>
              <div className="flex h-4 overflow-hidden rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]" role="img" aria-label="선택한 향 계열 색 띠">
                {families.map((f, i) => (
                  <span key={`${f}-${i}`} className="h-full flex-1" style={{ background: `var(--${f})` }} />
                ))}
              </div>
              <p className="text-center text-[11px] leading-4 tracking-[0.55px] text-slate">
                {families.map((f) => FAMILY_PHRASE[f]).join(' → ')}
              </p>
            </div>
          )}
        </section>
      )}

      {/* INDEX 03 피하고 싶은 느낌 */}
      {step < 3 ? (
        <Pending title="INDEX 03 · 피하고 싶은 느낌" text="아직 고르지 않았어요" badge="STANDBY" dashed={step === 2} icon={step === 2 ? hourglass : undefined} />
      ) : (
        <section className={`${box} flex flex-col gap-1 bg-mist/60`}>
          <span className={label}>INDEX 03 · 피하고 싶은 느낌 (EXCLUDED)</span>
          {avoids.length === 0 ? (
            <p className="pt-1 text-sm text-slate">건너뛰었어요</p>
          ) : (
            <ul className="flex flex-col gap-1.5 pt-1">
              {avoids.map((a) => (
                <li key={a.id} className="flex w-fit max-w-full flex-wrap items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                  <img src={block} alt="" width={11.67} height={11.67} />
                  {a.label}
                  <span className="text-[11px] tracking-[0.55px] text-slate">({AVOID_HINT[a.id]})</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 하단 안내 */}
      {step === 1 && (
        <div className="relative flex flex-col gap-2 rounded-xl border border-line bg-mist p-4">
          <div className="flex items-center gap-2">
            <img src={predict} alt="" width={13.33} height={13.33} />
            <span className="text-sm font-medium text-ink">어울리는 향수 미리보기</span>
          </div>
          <p className="text-sm leading-[22.75px] text-slate">
            {moods.length > 0 ? (
              <>
                고른 분위기(<b className="font-normal text-ink">{moods.map((m) => m.label).join(', ')}</b>)를 모두 가진 향수가{' '}
                {p.candidates.all > 0 ? (
                  <>
                    <b className="font-normal text-ink">{p.candidates.all}종</b> 있어요.
                  </>
                ) : (
                  <b className="font-normal text-ink">아직 없어요.</b>
                )}
              </>
            ) : (
              '분위기를 고르면 어울리는 향수가 몇 종인지 바로 알려 드려요.'
            )}
          </p>
          {moods.length > 0 && (
            <p className="flex items-center gap-2 pt-1 text-[11px] tracking-[0.55px] text-slate">
              <span className="size-1.5 rounded-full bg-slate" aria-hidden="true" />
              {p.candidates.all >= 3
                ? `하나라도 맞는 향수까지 넓히면 ${p.candidates.any}종이에요`
                : `모두 맞는 향수가 적어서, 하나라도 맞는 ${p.candidates.any}종 중에서 가까운 향수를 함께 골라 드려요`}
            </p>
          )}
        </div>
      )}
      {step === 2 && families.length > 0 && (
        <div className="flex gap-2.5 rounded-xl bg-mist p-3.5">
          <img src={sequence} alt="" width={12.75} height={18.5} className="mt-0.5 h-[18.5px] shrink-0" />
          <p className="text-[11px] leading-[17.88px] tracking-[0.55px] text-slate">
            <b className="font-normal text-ink">이 순서로 맡아보게 될 거예요:</b> {families.map((f) => FAMILY_PHRASE[f]).join(' → ')}
          </p>
        </div>
      )}
      {step === 3 && (
        <div className="flex flex-col gap-1 rounded-xl bg-mist p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <img src={checkDone} alt="" width={14.67} height={14} />
            고르기를 마쳤어요
          </p>
          <p className="text-sm leading-[22.75px] text-slate">가벼운 향부터 맡아볼 시향 후보 3개를 보여 드릴게요.</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex gap-3">
          {step === 3 ? (
            <button type="button" onClick={p.onSkip} className="h-[52px] flex-1 rounded-btn bg-mist text-lg tracking-[-0.18px] text-ink hover:bg-line/50">
              건너뛰기
            </button>
          ) : (
            p.onBack && (
              <button type="button" onClick={p.onBack} className="h-[52px] rounded-btn border border-line bg-card px-[21px] text-base tracking-[-0.08px] text-ink hover:bg-mist">
                이전
              </button>
            )
          )}
          <button
            type="button"
            disabled={!p.canNext}
            onClick={p.onNext}
            className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-btn bg-ink px-6 text-base tracking-[-0.08px] text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-ink-deep disabled:cursor-not-allowed disabled:bg-hint"
          >
            {p.nextLabel}
            <img src={arrowRight} alt="" width={12} height={12} />
          </button>
        </div>
        {!p.canNext && <p className="text-center text-xs text-slate">{p.hint}</p>}
        <button type="button" onClick={p.onRestart} className="mx-auto flex min-h-8 items-center gap-1 text-[11px] tracking-[0.55px] text-slate underline decoration-line">
          <img src={restart} alt="" width={9.33} height={10.76} />
          처음부터 다시 고르기
        </button>
      </div>
    </aside>
  )
}

function Pending({ title, text, badge, dashed, icon }: { title: string; text: string; badge: string; dashed?: boolean; icon?: string }) {
  return (
    <section className={`flex items-center justify-between rounded-xl border bg-card p-[15px] ${dashed ? 'border-dashed border-line bg-mist/60' : 'border-line/40'}`}>
      <div className="flex items-center gap-2">
        {icon && <img src={icon} alt="" width={12} height={15} />}
        <div className="flex flex-col gap-0.5">
          <span className={`${label} normal-case text-slate/70`}>{title}</span>
          <span className="text-sm text-slate/70">{text}</span>
        </div>
      </div>
      <span className="rounded bg-mist px-2 py-0.5 font-mono text-[11px] tracking-[0.55px] text-slate/60">{badge}</span>
    </section>
  )
}
