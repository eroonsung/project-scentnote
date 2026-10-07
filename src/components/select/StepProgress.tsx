import stageActive from '../../assets/icons/select/stage-active.svg'
import stageCheck from '../../assets/icons/select/stage-check.svg'
import stageCheckCircle from '../../assets/icons/select/stage-check-circle.svg'
import stageMark from '../../assets/icons/select/stage-mark.svg'
import stagePending from '../../assets/icons/select/stage-pending.svg'

const NAMES = ['01 분위기 선택', '02 선호 향조', '03 피하고 싶은 노트'] as const

interface Props {
  step: 1 | 2 | 3
  /** 단계 이동: 이미 지난 단계로만 돌아갈 수 있다 */
  onGo: (step: 1 | 2 | 3) => void
  moodCount: number
  objectCount: number
}

/** Step 1: 가운데 알약 + 3칸 게이지 */
function GaugeProgress({ step }: Pick<Props, 'step'>) {
  return (
    <div className="flex flex-col items-center">
      <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-line/40 bg-mist/60 px-[13px] py-[5px]">
        <b className="font-mono text-[11px] tracking-[1.1px] text-ink">STEP 0{step} / 03</b>
        <span className="size-1 rounded-full bg-hint" aria-hidden="true" />
        <span className="font-mono text-[11px] uppercase tracking-[0.55px] text-slate">TASTE DISCOVERY · FOR MYSELF</span>
      </span>
      <div className="flex w-full max-w-[640px] flex-col gap-3 pt-1">
        <div className="flex gap-2.5" role="presentation">
          {NAMES.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-ink' : 'bg-line'}`} />
          ))}
        </div>
        <ol className="flex text-center">
          {NAMES.map((n, i) => (
            <li key={n} className="flex flex-1 flex-col items-center" aria-current={i + 1 === step ? 'step' : undefined}>
              <span className={`text-[13px] tracking-[1.04px] ${i + 1 === step ? 'text-ink' : 'text-slate/60'}`}>{n}</span>
              <span className="font-mono text-[11px] text-slate/50">
                {i + 1 === step ? 'ACTIVE' : i + 1 < step ? 'DONE' : 'PENDING'}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

/** Step 2: 단계 카드 3개 */
function CardProgress({ step, onGo }: Pick<Props, 'step' | 'onGo'>) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-[17px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-line bg-mist px-[13px] py-[5px] font-mono text-[11px] uppercase tracking-[1.1px] text-slate">
            STEP 0{step} / 03 · SCENT FAMILY DISCOVERY · FOR MYSELF
          </span>
        </div>
        <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.55px] text-ink">
          <span className="size-2 rounded-full bg-ink" aria-hidden="true" />
          REAL-TIME ARCHIVING
        </span>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {NAMES.map((n, i) => {
          const no = (i + 1) as 1 | 2 | 3
          const done = no < step
          const active = no === step
          return (
            <li key={n} aria-current={active ? 'step' : undefined}>
              <button
                type="button"
                disabled={!done}
                onClick={() => onGo(no)}
                className={`relative flex w-full items-center gap-3.5 overflow-hidden rounded-lg text-left ${
                  active
                    ? 'border-2 border-ink bg-card p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                    : done
                      ? 'border border-line bg-mist px-[13px] py-3.5 hover:bg-line/40'
                      : 'border border-line/70 bg-mist/60 px-[13px] py-3.5 opacity-70'
                }`}
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                    active ? 'bg-ink' : done ? 'bg-line' : 'bg-mist'
                  }`}
                >
                  <img src={done ? stageCheck : active ? stageActive : stagePending} alt="" className="max-h-[10px] max-w-[15px]" />
                </span>
                <span className="flex flex-col">
                  <span className={`font-mono text-[11px] uppercase tracking-[0.55px] ${active ? 'font-bold text-slate' : 'text-slate'}`}>
                    STAGE 0{no} · {done ? 'COMPLETED' : active ? 'ACTIVE' : 'PENDING'}
                  </span>
                  <span className={`text-xs tracking-[0.48px] ${active ? 'font-bold text-ink' : 'text-ink'}`}>{n}</span>
                </span>
                {active && <span className="absolute inset-y-0 right-0 w-1 bg-ink" aria-hidden="true" />}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** Step 3: 회색 띠 안의 단계 카드 (마지막 단계는 잉크색) */
function BandProgress({ step, onGo, moodCount, objectCount }: Props) {
  const badge = ['기록완료', `${objectCount}종 등록`]
  void moodCount
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.55px] text-slate">
        <span>STEP 0{step} / 03 · EXCLUSION FILTER · FOR MYSELF</span>
        <span className="flex items-center gap-1 tracking-[1.1px]">
          <span className="size-2 rounded-full bg-ink" aria-hidden="true" />
          REAL-TIME ARCHIVING
        </span>
      </div>
      <ol className="grid gap-4 md:grid-cols-3">
        {NAMES.map((n, i) => {
          const no = (i + 1) as 1 | 2 | 3
          const active = no === step
          return (
            <li key={n} aria-current={active ? 'step' : undefined}>
              <button
                type="button"
                disabled={active}
                onClick={() => onGo(no)}
                className={`flex w-full items-center justify-between rounded-xl p-4 text-left ${
                  active ? 'bg-ink shadow-float' : 'bg-card shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-mist'
                }`}
              >
                <span className="flex items-center gap-2">
                  <img src={active ? stageMark : stageCheckCircle} alt="" className="h-[16.67px] w-auto" />
                  <span className="flex flex-col">
                    <span className={`font-mono text-[11px] tracking-[0.55px] ${active ? 'text-hint' : 'text-slate'}`}>
                      STAGE 0{no} · {active ? 'CURRENT' : 'COMPLETED'}
                    </span>
                    <span className={`text-sm ${active ? 'text-white' : 'text-ink'}`}>{n}</span>
                  </span>
                </span>
                {active ? (
                  <span className="rounded-full bg-card px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-[0.55px] text-ink">ACTIVE</span>
                ) : (
                  <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] tracking-[0.55px] text-slate">{badge[i]}</span>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default function StepProgress(props: Props) {
  if (props.step === 1) return <GaugeProgress step={props.step} />
  if (props.step === 2) return <CardProgress step={props.step} onGo={props.onGo} />
  return <BandProgress {...props} />
}
