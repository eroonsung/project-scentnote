import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import StepProgress from '../components/select/StepProgress'
import { AvoidStep, MoodStep, ScentStep } from '../components/select/StepLeft'
import TastePanel from '../components/select/TastePanel'
import { useSelection } from '../context/SelectionContext'
import { CHIPS, PERFUMES } from '../lib/perfumes'
import { countCandidates } from '../lib/recommend'
import type { Mode } from '../types'

type Step = 1 | 2 | 3

const NEXT_LABEL: Record<Step, string> = { 1: '다음 (02 향기 선택)', 2: '다음 (03 비선호 노트)', 3: '시향 후보 보기' }
const HINT: Record<Step, string> = {
  1: '분위기를 1개 이상 골라 주세요',
  2: '향기를 1개 이상 골라 주세요',
  3: '',
}

export default function Select() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { selection, setMode, toggle, clear, reset } = useSelection()

  const mode: Mode = params.get('mode') === 'gift' ? 'gift' : 'self'
  const raw = Number(params.get('step'))
  const step: Step = raw === 2 || raw === 3 ? raw : 1

  // 주소로 바로 들어와도 모드가 맞도록
  useEffect(() => {
    if (selection.mode !== mode) setMode(mode)
  }, [mode, selection.mode, setMode])

  // 단계가 바뀌면 맨 위로
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  const goStep = (s: Step) => setParams({ mode, step: String(s) })
  const canNext = step === 1 ? selection.moods.length >= 1 : step === 2 ? selection.objects.length >= 1 : true

  const onNext = () => {
    if (!canNext) return
    if (step === 3) navigate('/result')
    else goStep((step + 1) as Step)
  }
  const onBack = () => (step === 1 ? navigate('/') : goStep((step - 1) as Step))
  const onRestart = () => {
    reset()
    setMode(mode)
    goStep(1)
  }
  const onToggle = (group: 'moods' | 'objects' | 'avoids', id: string) => toggle(group, id, 3)

  if (mode === 'gift') {
    return (
      <main className="mx-auto flex max-w-[1120px] flex-col items-start gap-4 px-6 py-12">
        <h1 className="text-[32px] font-medium text-ink">선물할 향수 찾기</h1>
        <p className="text-slate">선물 모드 화면은 곧 만들어 드릴게요.</p>
        <Link to="/select?mode=self" className="inline-flex h-[52px] items-center rounded-btn bg-ink px-8 text-white">
          나를 위한 향수 찾기로 가기
        </Link>
      </main>
    )
  }

  const panel = (
    <TastePanel
      step={step}
      selection={selection}
      candidateCount={countCandidates(PERFUMES, CHIPS, selection)}
      nextLabel={NEXT_LABEL[step]}
      canNext={canNext}
      hint={HINT[step]}
      onNext={onNext}
      onBack={onBack}
      onSkip={() => {
        // 건너뛰기: 피하고 싶은 느낌을 비우고 다음으로
        clear('avoids')
        navigate('/result')
      }}
      onRestart={onRestart}
      onRemoveMood={(id) => toggle('moods', id, 3)}
    />
  )
  const progress = (
    <StepProgress step={step} onGo={goStep} moodCount={selection.moods.length} objectCount={selection.objects.length} />
  )
  const left =
    step === 1 ? <MoodStep selection={selection} onToggle={onToggle} /> : step === 2 ? <ScentStep selection={selection} onToggle={onToggle} /> : <AvoidStep selection={selection} onToggle={onToggle} />

  return (
    <main className="pb-24 lg:pb-0">
      {step === 3 && <div className="bg-mist/70 px-6 py-6"><div className="mx-auto max-w-[1120px]">{progress}</div></div>}
      <div className="mx-auto flex max-w-[1120px] flex-col gap-10 px-6 py-10">
        {step !== 3 && progress}
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">{left}</div>
          <div className="min-w-0 lg:col-span-5 lg:sticky lg:top-24">{panel}</div>
        </div>
      </div>
      {/* 모바일: 하단 고정 다음 버튼 */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-paper/95 p-3 backdrop-blur-[6px] lg:hidden">
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className="h-[52px] w-full rounded-btn bg-ink text-base text-white disabled:cursor-not-allowed disabled:bg-hint"
        >
          {canNext ? NEXT_LABEL[step] : HINT[step]}
        </button>
      </div>
    </main>
  )
}
