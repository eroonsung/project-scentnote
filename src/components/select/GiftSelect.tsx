import checkWhite from '../../assets/icons/gift/check-white.svg'
import compass from '../../assets/icons/gift/compass.svg'
import curator from '../../assets/icons/gift/curator.svg'
import { CHIPS } from '../../lib/perfumes'
import type { Selection } from '../../types'

type GiftStep = 1 | 2

const STAGES = ['받는 사람 분위기', '피하고 싶은 느낌'] as const

/** 선물 모드 진행 표시 (2단계) */
export function GiftProgress({ step, onGo }: { step: GiftStep; onGo: (s: GiftStep) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.55px] text-slate">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-ink" aria-hidden="true" />
          STEP 0{step} / 02 · {step === 1 ? '분위기 발견' : '불호 걸러내기'} · 선물 모드
        </span>
        <span className="hidden sm:block">ARCHIVAL PROTOCOL NO. 20{step}</span>
      </div>
      <div className="flex h-1.5 gap-2 overflow-hidden rounded-full bg-mist" role="presentation">
        {STAGES.map((_, i) => (
          <span key={i} className={`flex-1 rounded-full ${i < step ? 'bg-ink' : 'bg-line/60'}`} />
        ))}
      </div>
      <ol className="flex pt-1">
        {STAGES.map((n, i) => {
          const no = (i + 1) as GiftStep
          const active = no === step
          return (
            <li key={n} className={`flex flex-1 ${active ? '' : 'opacity-60'}`} aria-current={active ? 'step' : undefined}>
              <button type="button" disabled={no >= step} onClick={() => onGo(no)} className="flex items-center gap-2 text-left">
                <span className={`font-mono text-[13px] font-bold tracking-[0.65px] ${active ? 'text-ink' : 'text-slate'}`}>0{no}</span>
                <span className={`text-sm ${active ? 'text-ink' : 'text-slate'}`}>{n}</span>
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[11px] leading-[11px] tracking-[0.55px] ${
                    active ? 'bg-ink text-hint' : 'bg-mist text-slate'
                  }`}
                >
                  {active ? 'ACTIVE' : no < step ? 'DONE' : 'PENDING'}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

interface MoodProps {
  selection: Selection
  onToggleMood: (id: string) => void
  onUnsure: () => void
}

const pill = 'inline-flex min-h-11 items-center gap-1.5 rounded-chip px-4 text-sm transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50'

/** 선물 Step 1 왼쪽: 받는 사람의 분위기 칩 + [잘 모르겠어요] */
export function GiftMoodStep({ selection, onToggleMood, onUnsure }: MoodProps) {
  const full = selection.moods.length >= 3
  return (
    <div className="flex flex-col">
      <p className="mb-3 w-fit rounded bg-mist px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[1.1px] text-slate">
        ARCHIVAL QUERY NO. 201 · RECIPIENT AURA
      </p>
      <h1 className="pb-4 text-[32px] font-medium leading-10 tracking-[-1px] text-ink md:text-[40px] md:leading-[52px]">그 사람은 어떤 분위기인가요?</h1>
      <p className="max-w-[576px] pb-8 text-base leading-[26px] tracking-[-0.08px] text-slate">
        상대방을 떠올렸을 때 느껴지는 인상을 1~3개 골라 주세요. 선물 받는 분의 일상과 스타일에 자연스럽게 스며드는 향을 찾아 드려요.
      </p>

      <div className="flex flex-col gap-3 pb-8">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-semibold uppercase tracking-[0.6px] text-slate">분위기 칩 (최대 3개 선택)</span>
          <span className="font-mono text-[11px] font-bold tracking-[0.55px] text-ink">선택됨: {selection.moods.length} / 3</span>
        </div>
        <div className="flex flex-wrap gap-2.5" role="group" aria-label="받는 사람의 분위기 (1~3개 선택)">
          {CHIPS.moods.map((m) => {
            const on = selection.moods.includes(m.id)
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={on}
                disabled={full && !on}
                onClick={() => onToggleMood(m.id)}
                className={`${pill} ${on ? 'bg-ink text-white' : 'bg-card text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-mist'}`}
              >
                {on && <img src={checkWhite} alt="" width={10.87} height={8.02} />}
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-3 rounded-xl bg-mist p-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          aria-pressed={selection.unsure}
          onClick={onUnsure}
          className={`${pill} w-fit ${selection.unsure ? 'bg-ink text-white' : 'bg-line text-ink hover:bg-line/70'}`}
        >
          <img src={compass} alt="" width={15} height={15} className={selection.unsure ? 'invert' : ''} />
          잘 모르겠어요 · 호불호 적은 향으로
        </button>
        <p className="pl-1 text-sm leading-[22.75px] text-slate">
          서프라이즈 선물이라 취향을 직접 묻기 어렵다면 이 옵션을 선택해 보세요. 호불호가 적은 향을 먼저 추천해 드려요.
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-mist p-6">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.6px] text-woody-deep">
          <img src={curator} alt="" width={16.5} height={15.75} />
          GIFT NOTE · 선물 고르는 방법
        </p>
        <p className="text-sm leading-[22.75px] text-ink">
          향수를 선물할 때는 취향을 단번에 맞추려 하기보다, 상대방의 평소 옷차림이나 첫인상과 자연스럽게 어울리는 <b className="font-normal">'향의 결'</b>을
          고르는 편이 부담 없고 좋은 선물이 돼요.
        </p>
      </div>
    </div>
  )
}
