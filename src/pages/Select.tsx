import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GiftMoodStep, GiftProgress } from '../components/select/GiftSelect'
import GiftPanel from '../components/select/GiftPanel'
import StepProgress from '../components/select/StepProgress'
import { AvoidStep, MoodStep, ScentStep } from '../components/select/StepLeft'
import TastePanel from '../components/select/TastePanel'
import { useSelection } from '../context/SelectionContext'
import { CHIPS, PERFUMES } from '../lib/perfumes'
import { countCandidates } from '../lib/recommend'
import { SCENES } from '../lib/scenes'
import type { Mode } from '../types'

type Step = 1 | 2 | 3

const NEXT_LABEL: Record<Step, string> = { 1: '다음 (02 향기 선택)', 2: '다음 (03 피하고 싶은 느낌)', 3: '시향 후보 보기' }
const HINT: Record<Step, string> = {
  1: '분위기를 1개 이상 골라 주세요',
  2: '향기를 1개 이상 골라 주세요',
  3: '',
}
const LOW_COUNT = PERFUMES.filter((p) => p.polarizing === 'low').length

export default function Select() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { selection, setMode, toggle, clear, setUnsure, reset } = useSelection()

  const mode: Mode = params.get('mode') === 'gift' ? 'gift' : 'self'
  const maxStep = mode === 'gift' ? 2 : 3
  const raw = Number(params.get('step'))
  const step = (raw >= 2 ? Math.min(raw, maxStep) : 1) as Step

  // 주소로 바로 들어와도 모드가 맞도록
  useEffect(() => {
    if (selection.mode !== mode) setMode(mode)
  }, [mode, selection.mode, setMode])

  // 단계가 바뀌면 맨 위로
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step, mode])

  const goStep = (s: Step) => setParams({ mode, step: String(s) })
  const gift = mode === 'gift'
  const lastStep = step === maxStep
  const canNext = gift
    ? step === 1
      ? selection.moods.length >= 1 || selection.unsure
      : true
    : step === 1
      ? selection.moods.length >= 1
      : step === 2
        ? selection.objects.length >= 1
        : true
  const hint = gift ? '분위기를 고르거나 \'잘 모르겠어요\'를 눌러 주세요' : HINT[step]
  const nextLabel = gift ? (step === 1 ? '다음 (02 피하고 싶은 느낌)' : '시향 후보 보기') : NEXT_LABEL[step]

  const onNext = () => {
    if (!canNext) return
    if (lastStep) navigate('/result')
    else goStep((step + 1) as Step)
  }
  const onBack = () => (step === 1 ? navigate('/') : goStep((step - 1) as Step))
  const onRestart = () => {
    reset()
    setMode(mode)
    goStep(1)
  }
  const onSkip = () => {
    // 건너뛰기: 피하고 싶은 느낌을 비우고 결과로
    clear('avoids')
    navigate('/result')
  }
  const onToggle = (group: 'moods' | 'objects' | 'avoids', id: string) => toggle(group, id, 3)

  let progress, left, panel
  if (gift) {
    progress = <GiftProgress step={step as 1 | 2} onGo={(s) => goStep(s)} />
    left =
      step === 1 ? (
        <GiftMoodStep selection={selection} onToggleMood={(id) => onToggle('moods', id)} onUnsure={() => setUnsure(!selection.unsure)} />
      ) : (
        <AvoidStep selection={selection} onToggle={onToggle} gift />
      )
    panel = (
      <GiftPanel
        step={step as 1 | 2}
        selection={selection}
        lowCount={LOW_COUNT}
        totalCount={PERFUMES.length}
        canNext={canNext}
        hint={hint}
        onNext={onNext}
        onBack={onBack}
        onSkip={onSkip}
        onEditMood={() => goStep(1)}
        onRestart={onRestart}
        onSwitchToSelf={() => {
          reset()
          setMode('self')
          navigate('/select?mode=self')
        }}
      />
    )
  } else {
    progress = <StepProgress step={step} onGo={goStep} moodCount={selection.moods.length} objectCount={selection.objects.length} />
    const scene = SCENES.find((sc) => sc.id === params.get('scene'))
    left =
      step === 1 ? (
        <MoodStep selection={selection} onToggle={onToggle} />
      ) : step === 2 ? (
        <ScentStep selection={selection} onToggle={onToggle} />
      ) : (
        <div className="flex flex-col gap-8">
          {scene && selection.moods.length > 0 && (
            <p className="rounded-xl border border-line bg-mist px-5 py-4 text-sm leading-[22px] text-ink" role="status">
              <b className="font-medium">'{scene.title}'</b> 장면에 맞춰 분위기와 향기를 미리 골라 두었어요. 바꾸고 싶으면 위의 <b className="font-medium">01 분위기</b>,{' '}
              <b className="font-medium">02 향기</b> 단계를 눌러 고칠 수 있어요.
            </p>
          )}
          <AvoidStep selection={selection} onToggle={onToggle} />
        </div>
      )
    panel = (
      <TastePanel
        step={step}
        selection={selection}
        candidates={countCandidates(PERFUMES, CHIPS, selection)}
        nextLabel={nextLabel}
        canNext={canNext}
        hint={hint}
        onNext={onNext}
        onBack={onBack}
        onGoStep={(s) => goStep(s)}
        onSkip={onSkip}
        onRestart={onRestart}
        onRemoveMood={(id) => toggle('moods', id, 3)}
      />
    )
  }

  const bandProgress = !gift && step === 3

  return (
    <main className="pb-24 lg:pb-0">
      {bandProgress && <div className="bg-mist/70 px-6 py-6"><div className="mx-auto max-w-[1120px]">{progress}</div></div>}
      <div className="mx-auto flex max-w-[1120px] flex-col gap-10 px-6 py-10">
        {!bandProgress && progress}
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">{left}</div>
          <div className="min-w-0 lg:sticky lg:top-24 lg:col-span-5">{panel}</div>
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
          {canNext ? nextLabel : hint}
        </button>
      </div>
    </main>
  )
}
