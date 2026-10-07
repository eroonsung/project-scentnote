import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelection } from '../context/SelectionContext'
import ScentStrips from '../components/ScentStrips'
import curveLine from '../assets/icons/curve-line.svg'
import shieldCheck from '../assets/icons/shield-check.svg'
import gridSmall from '../assets/icons/grid-small.svg'
import noteFatigue from '../assets/icons/note-fatigue.svg'
import stepCards from '../assets/icons/step-cards.svg'
import stepBottles from '../assets/icons/step-bottles.svg'
import stepNotebook from '../assets/icons/step-notebook.svg'

const STEPS = [
  {
    no: '01',
    icon: stepCards,
    title: '① 느낌 고르기',
    body: "어려운 향수 용어 대신 '비 내린 숲길', '린넨 셔츠' 같은 일상의 느낌 카드를 선택합니다.",
    tag: '복수 선택 가능',
  },
  {
    no: '02',
    icon: stepBottles,
    title: '② 시향 후보 3개 받기',
    body: '수많은 향수 중 내 취향에 딱 맞고 매장에서 바로 맡아볼 수 있는 3가지를 엄선해 드려요.',
    tag: '가벼운 향부터 묵직한 순',
  },
  {
    no: '03',
    icon: stepNotebook,
    title: '③ 순서대로 맡고 기록하기',
    body: '코 피로도를 낮추는 01 → 02 → 03 순서로 시향하고, 모바일 카드에 솔직한 첫인상을 기록하세요.',
    tag: '현장 체크리스트 제공',
  },
]

const primaryBtn =
  'inline-flex h-[52px] items-center justify-center gap-2 rounded-btn bg-ink px-8 text-base tracking-[-0.08px] text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-ink-deep'
const secondaryBtn =
  'inline-flex h-[52px] items-center justify-center rounded-btn border border-line bg-card px-8 text-base tracking-[-0.08px] text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-mist'

export default function Home() {
  const { setMode } = useSelection()
  const heroButtons = useRef<HTMLDivElement>(null)

  // 하단 배너 버튼: 상단의 "나를 위한 / 선물할" 버튼 위치로 올라간다
  const scrollToStart = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    heroButtons.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    heroButtons.current?.querySelector('a')?.focus({ preventScroll: true })
  }

  return (
    <main>
      <div className="mx-auto flex max-w-[1120px] flex-col gap-20 px-6 pb-20 pt-12">
        {/* Hero */}
        <section className="grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col">
            <span className="mb-6 inline-flex w-fit max-w-full items-center gap-2 rounded-full bg-mist px-3 py-1.5">
              <span className="size-1.5 rounded-full bg-ink" aria-hidden="true" />
              <span className="text-xs leading-4 tracking-[0.3px] text-slate">매장 가기 전에 미리 정하는 시향 후보 3개</span>
            </span>
            <h1 className="text-[32px] font-medium leading-[44px] tracking-[-1px] text-ink md:text-[40px] md:leading-[52px]">
              직접 맡아봐야 아는 향수,
              <br />
              무엇부터 맡아볼까요?
            </h1>
            <p className="mt-5 text-base leading-[26px] tracking-[-0.08px] text-slate">
              좋아하는 느낌을 고르면 맡아볼 향수 3개와 맡는 순서를 알려 드려요.
            </p>
            <ul className="mt-6 flex flex-col gap-3 rounded-xl bg-mist px-4 py-3.5 text-sm text-ink sm:flex-row sm:items-center sm:gap-4">
              <li className="flex items-center gap-2">
                <img src={shieldCheck} alt="" width={15.58} height={14.88} />
                구매 권유 없는 순수 시향 가이드
              </li>
              <li className="hidden h-3 w-px bg-line sm:block" aria-hidden="true" />
              <li className="flex items-center gap-2">
                <img src={gridSmall} alt="" width={12.75} height={12.75} />
                코 피로도를 줄여주는 순서 추천
              </li>
            </ul>
            <div ref={heroButtons} className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/select?mode=self" onClick={() => setMode('self')} className={primaryBtn}>
                나를 위한 향수 찾기 <span aria-hidden="true" className="text-[11px]">→</span>
              </Link>
              <Link to="/select?mode=gift" onClick={() => setMode('gift')} className={secondaryBtn}>
                선물할 향수 찾기
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3 pt-6 text-xs leading-4 tracking-[0.3px] text-slate">
              <li className="flex items-center gap-1.5">
                <b className="font-mono text-[13px] tracking-[1.04px] text-ink">14</b> 향 계열
              </li>
              <li className="size-1 rounded-full bg-line" aria-hidden="true" />
              <li className="flex items-center gap-1.5">
                <b className="font-mono text-[13px] tracking-[1.04px] text-ink">3</b> 시향 후보 · 가벼운 향부터
              </li>
              <li className="size-1 rounded-full bg-line" aria-hidden="true" />
              <li>광고·구매 링크 없음</li>
            </ul>
          </div>

          {/* 시향지 띠 */}
          <div className="relative min-w-0">
            <div className="relative overflow-hidden rounded-card bg-card p-7 shadow-float">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, var(--ink) 5%, transparent 5%), linear-gradient(180deg, var(--ink) 5%, transparent 5%)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="relative flex items-center justify-between pb-5">
                <span className="flex items-center gap-2 font-mono text-[13px] font-bold uppercase tracking-[0.65px] text-ink">
                  <span className="size-2 rounded-full bg-ink" aria-hidden="true" />
                  시향지로 보는 향 계열 14가지
                </span>
                <span className="hidden rounded-full bg-mist px-2.5 py-0.5 font-mono text-[11px] tracking-[0.55px] text-slate sm:inline">
                  가벼운 향 → 진한 향
                </span>
              </div>
              <img src={curveLine} alt="" className="relative mb-2 h-8 w-full" />
              <div className="relative">
                <ScentStrips />
              </div>
              <div className="relative flex items-center justify-between gap-4 pt-4 font-mono text-[11px] leading-4 tracking-[0.55px] text-slate">
                <p>
                  <b className="mr-2 text-ink">시향 순서 예시</b>
                  01 시트러스 → 02 플로럴 → 03 우디
                </p>
                <p className="hidden shrink-0 text-right opacity-70 sm:block">
                  14개
                  <br />
                  향 계열
                </p>
              </div>
            </div>
            <div className="mt-4 flex max-w-[280px] items-center gap-3 rounded-xl bg-card p-4 shadow-float lg:absolute lg:-bottom-10 lg:-left-5 lg:mt-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mist">
                <img src={noteFatigue} alt="" width={16.67} height={14.17} />
              </span>
              <span>
                <span className="block text-xs font-semibold leading-4 tracking-[0.3px] text-slate">시향 팁</span>
                <span className="block text-sm leading-[17.5px] text-ink">가벼운 향부터 맡아 보세요</span>
              </span>
            </div>
          </div>
        </section>

        <hr className="border-line/60" />

        {/* 이용 방법 */}
        <section aria-labelledby="how-it-works">
          <div className="flex flex-col justify-between gap-3 pb-10 md:flex-row md:items-end">
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[13px] font-bold uppercase tracking-[0.65px] text-slate">HOW IT WORKS</span>
              <h2 id="how-it-works" className="text-2xl font-medium tracking-[-0.6px] text-ink">
                어떻게 이용하나요? <span className="text-sm font-normal tracking-normal text-slate">(3-Step Field Guide)</span>
              </h2>
            </div>
            <p className="text-sm text-slate">복잡한 백화점 1층에서도 길을 잃지 않는 명확한 3단계 안내</p>
          </div>
          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <li
                key={s.no}
                className="flex flex-col justify-between rounded-card bg-card p-7 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] font-bold tracking-[0.65px] text-slate">STEP {s.no}</span>
                    <span className="flex size-10 items-center justify-center rounded-xl bg-mist">
                      <img src={s.icon} alt="" width={20} height={20} />
                    </span>
                  </div>
                  <h3 className="pt-3 text-lg font-medium leading-[26px] tracking-[-0.18px] text-ink">{s.title}</h3>
                  <p className="text-sm leading-[22.75px] text-slate">{s.body}</p>
                </div>
                <div className="flex items-center justify-between pt-12">
                  <span className="rounded-full bg-mist px-2.5 py-1 text-[11px] leading-4 tracking-[0.55px] text-slate">
                    {s.tag}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.55px] text-slate/60">Phase {Number(s.no)}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 하단 배너 */}
        <section className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-card bg-mist p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)] md:flex-row md:items-center md:p-12">
          <span className="absolute inset-y-0 left-0 w-1.5 bg-ink" aria-hidden="true" />
          <div className="flex max-w-[620px] flex-col gap-2">
            <span className="font-mono text-[13px] font-bold uppercase tracking-[0.65px] text-slate">CURATOR NOTE</span>
            <p className="text-lg leading-[29.25px] tracking-[-0.18px] text-ink">
              "향수는 종이 설명글이 아닌, 내 코와 피부로 직접 경험할 때 비로소 완성됩니다."
            </p>
            <p className="pt-1 text-sm leading-[22px] text-slate">
              지금 바로 3분 큐레이션을 시작하고, 주말 오프라인 시향을 준비해보세요.
            </p>
          </div>
          <button type="button" onClick={scrollToStart} className={`${primaryBtn} shrink-0`}>
            지금 큐레이션 시작 <span aria-hidden="true" className="text-[11px]">→</span>
          </button>
        </section>
      </div>
    </main>
  )
}
