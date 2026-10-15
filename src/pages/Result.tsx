import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import arrow from '../assets/icons/result/arrow.svg'
import guideFlask from '../assets/icons/result/guide-flask.svg'
import restart from '../assets/icons/result/restart.svg'
import summaryPill from '../assets/icons/result/summary-pill.svg'
import tip1 from '../assets/icons/result/tip-1.svg'
import tip2 from '../assets/icons/result/tip-2.svg'
import tip3 from '../assets/icons/result/tip-3.svg'
import tip4 from '../assets/icons/result/tip-4.svg'
import FeedbackBar from '../components/result/FeedbackBar'
import MemoSheet from '../components/result/MemoSheet'
import ScentCard from '../components/result/ScentCard'
import Toast from '../components/Toast'
import { useSelection } from '../context/SelectionContext'
import { CHIPS, FAMILIES, PERFUMES, TIPS } from '../lib/perfumes'
import { recommend } from '../lib/recommend'
import { recommendSimilar } from '../lib/similar'
import { eulReul, eunNeun, likedAvoidNotes, moodShrinkNotes } from '../lib/avoid'
import { syncFeedback } from '../lib/feedback'
import { loadMemos, saveMemo, syncMemos, useMemos } from '../lib/storage'
import type { Memo, Selection } from '../types'

const GUIDE = [
  { icon: tip1, title: '가벼운 향부터 순서대로' },
  { icon: tip2, title: '시향지에 이름 적어두기' },
  { icon: tip3, title: '손목 착향 후 30분 관찰' },
  { icon: tip4, title: '바로 사지 않아도 괜찮아요' },
]

/** 고른 칩을 한 줄 문장으로: "차분한, 깨끗한 분위기 · 비누·빨래 향 · 너무 단 향 제외" */
function summarize(s: Selection): string {
  if (s.likedId) {
    const liked = PERFUMES.find((p) => p.id === s.likedId)
    if (!liked) return '좋아하는 향수와 닮은 향'
    const name = `${liked.brandKo} ${liked.nameKo}`
    // 마지막 글자에 받침이 있으면 '과', 없거나 한글이 아니면 '와'
    const code = name.charCodeAt(name.length - 1) - 0xac00
    return `좋아하는 향수 '${name}'${code >= 0 && code <= 11171 && code % 28 !== 0 ? '과' : '와'} 닮은 향`
  }
  const label = <T extends { id: string; label: string }>(list: T[], ids: string[]) =>
    ids.map((id) => list.find((c) => c.id === id)?.label).filter(Boolean) as string[]
  const parts: string[] = []
  if (s.unsure) parts.push('분위기를 몰라서 호불호 적은 향 위주')
  const moods = label(CHIPS.moods, s.moods)
  if (moods.length) parts.push(`${moods.join(', ')} 분위기`)
  const objects = label(CHIPS.objects, s.objects)
  if (objects.length) parts.push(`${objects.join(', ')} 향`)
  const avoids = label(CHIPS.avoids, s.avoids)
  if (avoids.length) parts.push(`${avoids.join(', ')} 제외`)
  return parts.join(' · ')
}

export default function Result() {
  const { selection, reset, setMode } = useSelection()
  const navigate = useNavigate()
  const memos = useMemos()
  const [memoTarget, setMemoTarget] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const hasInput = selection.moods.length > 0 || selection.objects.length > 0 || selection.unsure || !!selection.likedId
  // 이미 별 1~2개를 준 향수는 다시 추천하지 않는다. 화면을 보는 동안 카드가 바뀌지 않게 들어올 때의 기록만 쓴다.
  const [lowRated] = useState(() => new Set(loadMemos().filter((m) => m.rating <= 2).map((m) => m.perfumeId)))
  const result = useMemo(
    () => {
      if (!hasInput) return null
      if (selection.likedId) return recommendSimilar(PERFUMES, CHIPS, FAMILIES, selection.likedId, selection.mode, { excludeIds: lowRated })
      return recommend(PERFUMES, CHIPS, FAMILIES, selection, { excludeIds: lowRated })
    },
    [hasInput, selection, lowRated],
  )

  useEffect(() => {
    window.scrollTo({ top: 0 })
    void syncMemos()
    void syncFeedback()
    return () => window.clearTimeout(toastTimer.current)
  }, [])

  if (!result) {
    return (
      <main className="mx-auto flex max-w-[1120px] flex-col items-start gap-4 px-6 py-16">
        <h1 className="text-[32px] font-medium text-ink">아직 고른 느낌이 없어요</h1>
        <p className="text-slate">느낌을 고르면 맡아볼 향수 3개와 맡는 순서를 알려 드려요.</p>
        <Link to="/select?mode=self" className="inline-flex h-[52px] items-center rounded-btn bg-ink px-8 text-white">
          시향 후보 찾기
        </Link>
      </main>
    )
  }

  const items = result.items
  const likedNotes = selection.likedId ? [] : likedAvoidNotes(PERFUMES, selection.avoids, selection.objects)
  const shrinkNotes = selection.likedId ? [] : moodShrinkNotes(PERFUMES, selection.moods, selection.avoids, selection.objects)
  const target = memoTarget !== null ? items[memoTarget] : null

  const onSaveMemo = (rating: number, text: string) => {
    if (!target) return
    const now = new Date().toISOString()
    const prev = memos.find((m) => m.perfumeId === target.perfume.id)
    const memo: Memo = { id: prev?.id ?? crypto.randomUUID(), perfumeId: target.perfume.id, rating, text, createdAt: prev?.createdAt ?? now }
    const ok = saveMemo(memo)
    setMemoTarget(null)
    setToast(ok ? '시향 노트에 저장했어요' : '저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요')
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }

  const onRestart = () => {
    const mode = selection.mode
    const similar = !!selection.likedId
    reset()
    setMode(mode)
    navigate(similar ? '/similar' : `/select?mode=${mode}`)
  }

  return (
    <main>
      {/* 상단 향 계열 색 띠 */}
      <div className="flex h-2" aria-hidden="true">
        {items.map((r) => (
          <span key={r.perfume.id} className="flex-1" style={{ background: `var(--${r.perfume.family})` }} />
        ))}
      </div>

      <div className="mx-auto flex max-w-[1120px] flex-col gap-10 px-6 py-10">
        <header className="mx-auto flex max-w-[672px] flex-col items-center gap-2 text-center">
          <span className="flex items-center gap-2 rounded-full bg-mist px-3 py-1 font-mono text-[13px] font-bold uppercase tracking-[1.3px] text-slate">
            <span className="size-1.5 rounded-full bg-ink" aria-hidden="true" />
            YOUR SNIFF LIST · {items.length}
          </span>
          <h1 className="pt-1 text-[32px] font-medium leading-10 tracking-[-1px] text-ink md:text-[40px] md:leading-[52px]">
            {selection.mode === 'gift' ? '이 순서로 맡아보고 골라 보세요' : '이 순서로 맡아보세요'}
          </h1>
          <p className="text-base leading-[26px] tracking-[-0.08px] text-slate">{summarize(selection)}</p>
          <p className="mt-2 flex items-center gap-2 rounded-lg bg-mist/80 px-3.5 py-1.5 text-sm text-ink">
            <img src={summaryPill} alt="" width={15} height={15} />
            가벼운 향부터 진한 향 순서예요
          </p>
          {likedNotes.map((n) => (
            <p key={`${n.scent}-${n.avoid}`} className="text-sm text-slate">
              선호하는 향으로 ‘{n.scent}’ 향기를 골라서, ‘{n.avoid}’{eunNeun(n.avoid)} 진한 향만 제외했어요.
            </p>
          ))}
          {shrinkNotes.map((n) => (
            <p key={`${n.mood}-${n.avoid}`} className="text-sm text-slate">
              ‘{n.mood}’ 분위기를 골랐는데 ‘{n.avoid}’{eulReul(n.avoid)} 제외해서, {n.mood} 분위기의 향수 {n.pool}개 중 {n.left}개만 남아요.
            </p>
          ))}
          {result.relaxed ? (
            <p className="text-sm text-slate">조건에 딱 맞는 향이 적어 비슷한 향을 함께 보여드려요.</p>
          ) : (
            result.partial && (
              <p className="text-sm text-slate">고른 느낌을 모두 가진 향수가 적어, 일부만 맞는 향수도 함께 보여 드려요. 카드에서 몇 개가 맞는지 확인해 보세요.</p>
            )
          )}
        </header>

        <section aria-label="시향 후보" className="flex flex-col gap-3">
          <div className="flex flex-col items-stretch gap-4 lg:flex-row">
            {items.map((r, i) => (
              <Fragment key={r.perfume.id}>
                {i > 0 && (
                  <div className="flex shrink-0 items-center justify-center lg:w-6" aria-hidden="true">
                    <img src={arrow} alt="" width={16} height={16} className="rotate-90 lg:rotate-0" />
                  </div>
                )}
                <div className="flex min-w-0 flex-1">
                  <ScentCard
                    index={i}
                    rec={r}
                    hasMemo={memos.some((m) => m.perfumeId === r.perfume.id)}
                    triedRating={memos.find((m) => m.perfumeId === r.perfume.id)?.rating}
                    gift={selection.mode === 'gift'}
                    onMemo={() => setMemoTarget(i)}
                  />
                </div>
              </Fragment>
            ))}
          </div>
          <p className="text-center text-[11px] tracking-[0.55px] text-hint">
            * 가격은 공식몰에서 확인한 값이에요. 가격은 변동될 수 있어요.
          </p>
        </section>

        <FeedbackBar
          base={{
            mode: selection.mode,
            moods: selection.moods,
            // 좋아하는 향수로 찾기는 서버 스키마를 바꾸지 않고 objects에 'like:<향수 id>'로 남긴다 (D-53)
            objects: selection.likedId ? [`like:${selection.likedId}`] : selection.objects,
            avoids: selection.avoids,
            unsure: selection.unsure,
            perfumeIds: items.map((r) => r.perfume.id),
          }}
        />

        <section className="flex flex-col gap-6 rounded-card border border-line/60 bg-mist p-6 md:p-[33px]" aria-labelledby="guide-title">
          <div className="flex items-center justify-between gap-3 border-b border-line/40 pb-[17px]">
            <h2 id="guide-title" className="flex items-center gap-2 font-mono text-[13px] font-bold uppercase tracking-[0.325px] text-ink">
              <img src={guideFlask} alt="" width={15} height={15} />
              OFFLINE SNIFFING GUIDE · 시향 팁 4가지
            </h2>
            <span className="hidden font-mono text-[11px] tracking-[0.55px] text-slate md:block">Archival Manual Sec. 04</span>
          </div>
          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {GUIDE.map((g, i) => (
              <li key={g.title} className="flex flex-col gap-2">
                <h3 className="flex items-center gap-2 text-base tracking-[-0.08px] text-ink">
                  <img src={g.icon} alt="" className="h-[9.46px] w-auto" />
                  {g.title}
                </h3>
                <p className="text-sm leading-[22.75px] text-slate">{TIPS[i]}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-col gap-4 border-t border-line/40 pb-6 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onRestart} className="flex min-h-11 items-center gap-1.5 text-sm text-slate hover:text-ink">
            <img src={restart} alt="" width={13.5} height={15.75} />
            다시 고르기
          </button>
          <Link to="/notes" className="inline-flex h-12 items-center justify-center rounded-xl bg-ink px-6 text-sm text-paper hover:bg-ink-deep">
            내 시향 노트 보기
          </Link>
        </div>
        <p className="text-center text-[11px] tracking-[-0.08px] text-hint">
          향수 정보는 직접 정리했고, 향수병 이미지는 향수마다 출처가 달라요(각 브랜드 공식 페이지 등).
        </p>
      </div>

      {target && memoTarget !== null && (
        <MemoSheet
          perfume={target.perfume}
          index={memoTarget}
          existing={memos.find((m) => m.perfumeId === target.perfume.id)}
          onSave={onSaveMemo}
          onClose={() => setMemoTarget(null)}
        />
      )}
      {toast && <Toast message={toast} />}
    </main>
  )
}
