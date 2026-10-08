import { Link, useNavigate } from 'react-router-dom'
import { useSelection } from '../context/SelectionContext'
import { CHIPS } from '../lib/perfumes'
import { SCENES } from '../lib/scenes'

const labelOf = (list: { id: string; label: string }[], id: string) => list.find((c) => c.id === id)?.label ?? id

/** 향수가 처음인 사람용 시작 화면: 마음에 드는 장면 하나를 고르면 분위기·향기가 미리 채워진다 */
export default function Start() {
  const { applyPreset } = useSelection()
  const navigate = useNavigate()

  const pick = (id: string) => {
    const scene = SCENES.find((s) => s.id === id)
    if (!scene) return
    applyPreset(scene.moods, scene.objects)
    // 분위기·향기가 채워졌으니 '피하고 싶은 느낌' 단계로 바로 간다
    navigate(`/select?mode=self&step=3&scene=${scene.id}`)
  }

  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-10 px-6 py-12">
      <header className="flex max-w-[640px] flex-col gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[1.1px] text-slate">FIRST TIME · 향수가 처음이에요</p>
        <h1 className="text-[32px] font-medium leading-10 tracking-[-1px] text-ink md:text-[40px] md:leading-[52px]">어떤 장면이 마음에 드나요?</h1>
        <p className="text-base leading-[26px] tracking-[-0.08px] text-slate">
          어려운 향수 말은 몰라도 괜찮아요. 가장 끌리는 장면 하나만 고르면, 어울리는 분위기와 향기는 저희가 미리 채워 드려요. 나중에 바꿀 수도 있어요.
        </p>
      </header>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SCENES.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => pick(s.id)}
              className="group flex h-full w-full flex-col overflow-hidden rounded-card border border-line bg-card text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-float"
            >
              <img src={s.image} alt="" className="aspect-[8/5] w-full object-cover" loading="lazy" />
              <span className="flex flex-1 flex-col gap-2 p-5">
                <b className="text-lg font-medium leading-[26px] tracking-[-0.18px] text-ink">{s.title}</b>
                <span className="text-sm leading-[22px] text-slate">{s.caption}</span>
                <span className="mt-auto flex flex-wrap gap-1.5 pt-1">
                  {[...s.moods.map((m) => labelOf(CHIPS.moods, m)), ...s.objects.map((o) => labelOf(CHIPS.objects, o))].map((t) => (
                    <span key={t} className="rounded-full bg-mist px-2.5 py-1 text-[11px] tracking-[0.55px] text-slate">
                      {t}
                    </span>
                  ))}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="text-sm text-slate">
        원하는 장면이 없나요?{' '}
        <Link to="/select?mode=self" className="font-medium text-ink underline underline-offset-4">
          직접 고르러 가기
        </Link>
      </p>
    </main>
  )
}
