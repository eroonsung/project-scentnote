import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import caretDown from '../assets/icons/notes/caret-down.svg'
import emptyNotebook from '../assets/icons/notes/empty-notebook.svg'
import familyReco from '../assets/icons/notes/family-reco.svg'
import hourglass from '../assets/icons/notes/hourglass.svg'
import stepQa from '../assets/icons/notes/step-qa.svg'
import memoIcon from '../assets/icons/result/memo.svg'
import AccountBar from '../components/account/AccountBar'
import MemoCard from '../components/notes/MemoCard'
import MemoSheet from '../components/result/MemoSheet'
import Toast from '../components/Toast'
import { PERFUMES } from '../lib/perfumes'
import { removeMemo, saveMemo, syncMemos, useMemos } from '../lib/storage'
import type { Memo } from '../types'

type Sort = 'newest' | 'oldest' | 'rating'
const SORT_LABEL: Record<Sort, string> = { newest: '최신 기록순', oldest: '오래된 기록순', rating: '별점 높은 순' }
const perfumeById = new Map(PERFUMES.map((p) => [p.id, p]))

export default function Notes() {
  const memos = useMemos()
  const [sort, setSort] = useState<Sort>('newest')
  const [editing, setEditing] = useState<Memo | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  // 오래된 순서대로 번호를 매긴다 (ARCHIVE · 001)
  const numbered = useMemo(() => {
    const byOld = [...memos].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const no = new Map(byOld.map((m, i) => [m.id, i + 1]))
    const list = [...memos]
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt))
    else if (sort === 'oldest') list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return list.map((m) => ({ memo: m, no: no.get(m.id) ?? 0 }))
  }, [memos, sort])

  const notify = (message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }

  // 들어올 때 서버와 맞춘다 (서버를 못 쓰면 브라우저에 있는 메모만 보여준다)
  useEffect(() => {
    void syncMemos()
    return () => window.clearTimeout(toastTimer.current)
  }, [])

  const onDelete = (memo: Memo) => {
    if (window.confirm('이 시향 노트를 삭제할까요?')) notify(removeMemo(memo.id) ? '삭제했어요' : '삭제하지 못했어요. 브라우저 저장 공간을 확인해 주세요')
  }

  const onSaveEdit = (rating: number, text: string) => {
    if (!editing) return
    notify(saveMemo({ ...editing, rating, text }) ? '시향 노트에 저장했어요' : '저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요')
    setEditing(null)
  }

  const editingPerfume = editing ? perfumeById.get(editing.perfumeId) : undefined

  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-10 px-6 py-10">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex max-w-[672px] flex-col gap-1">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase leading-4 tracking-[1.1px] text-slate">
            <span className="size-1.5 rounded-full bg-ink" aria-hidden="true" />
            MY SCENT ARCHIVE
          </p>
          <h1 className="text-[32px] font-medium leading-10 tracking-[-1px] text-ink md:text-[40px] md:leading-[52px]">내 시향 노트</h1>
          <p className="text-base leading-[26px] tracking-[-0.08px] text-slate">오프라인 매장에서 직접 맡아보고 기록한 향의 인상을 모아둔 아카이브입니다.</p>
        </div>
        {memos.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 font-mono text-[11px] tracking-[0.55px] text-slate">
              LOGS: <b className="text-[13px] tracking-[1.04px] text-ink">{memos.length}</b>
            </span>
            <label className="relative">
              <span className="sr-only">기록 정렬 기준</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="min-h-8 cursor-pointer appearance-none rounded-full bg-card py-1.5 pl-3 pr-8 font-mono text-[11px] tracking-[0.55px] text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
              >
                {(Object.keys(SORT_LABEL) as Sort[]).map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABEL[k]}
                  </option>
                ))}
              </select>
              <img src={caretDown} alt="" width={8} height={4.93} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </label>
          </div>
        )}
      </header>

      <AccountBar onNotify={notify} />

      {memos.length === 0 ? (
        <section className="flex flex-col items-center rounded-xl bg-card px-6 py-16 text-center shadow-[0_1px_1px_rgba(0,0,0,0.05)]" aria-labelledby="empty-title">
          <div className="relative mb-4 flex size-24 items-center justify-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-mist/60">
              <img src={emptyNotebook} alt="" width={26.67} height={33.33} />
            </span>
            <span className="absolute right-2 top-2 size-3 rounded-full bg-powdery-tint" aria-hidden="true" />
          </div>
          <h2 id="empty-title" className="text-2xl font-medium leading-[34px] tracking-[-0.6px] text-ink">
            아직 맡아본 향이 없어요
          </h2>
          <p className="max-w-[448px] pt-1 text-base leading-[26px] tracking-[-0.08px] text-slate">
            매장에서 시향하기 전, 취향 큐레이션을 먼저 받아보고 숏리스트를 만들어 보세요.
          </p>
          <Link to="/select?mode=self" className="mt-6 inline-flex h-[52px] items-center gap-2 rounded-xl bg-ink px-8 text-base tracking-[-0.08px] text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-ink-deep">
            시향 후보 찾기 <span aria-hidden="true" className="text-[13px]">→</span>
          </Link>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] tracking-[0.55px] text-slate">
            <li className="flex items-center gap-1">
              <img src={stepQa} alt="" width={11.67} height={8.79} />3단계 문답
            </li>
            <li className="flex items-center gap-1">
              <img src={familyReco} alt="" width={10.5} height={10.5} />맞춤 계열 추천
            </li>
            <li className="flex items-center gap-1">
              <img src={memoIcon} alt="" width={12} height={10.67} className="invert opacity-70" />별점·한 줄 메모 기록
            </li>
          </ul>
        </section>
      ) : (
        <section aria-label="시향 노트 목록" className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {numbered.map(({ memo, no }) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              perfume={perfumeById.get(memo.perfumeId)}
              archiveNo={no}
              onEdit={() => setEditing(memo)}
              onDelete={() => onDelete(memo)}
            />
          ))}
        </section>
      )}

      {/* 잔향 트래킹은 이번에 만들지 않는다: 준비 중 안내만 */}
      <section className="flex flex-col justify-between gap-4 rounded-xl bg-mist p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] md:flex-row md:items-center">
        <div className="flex gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-card shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <img src={hourglass} alt="" width={16} height={20} />
          </span>
          <div className="flex max-w-[672px] flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-medium leading-[26px] tracking-[-0.18px] text-ink">잔향 트래킹 준비 중</h2>
              <span className="rounded-full bg-ink-deep px-2 py-0.5 font-mono text-[11px] tracking-[0.275px] text-white">COMING SOON · TIMELINE PROTOCOL</span>
            </div>
            <p className="text-sm leading-[22.75px] text-slate">
              뿌린 뒤 30분, 2시간, 4시간의 향을 기록하는 기능이 곧 추가돼요. 탑노트의 첫인상부터 베이스의 마지막 잔향까지 시간 순서로 비교해 보세요.
            </p>
          </div>
        </div>
        <ol className="flex shrink-0 items-center gap-3 self-start rounded-lg bg-card px-4 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.05)] md:self-auto" aria-label="기록 예정 시점">
          {['0m', '30m', '2h', '4h'].map((t, i) => (
            <li key={t} className="flex items-center gap-3">
              {i > 0 && <span className="h-px w-6 bg-line" aria-hidden="true" />}
              <span className="flex flex-col items-center">
                <span className="font-mono text-[11px] tracking-[0.55px] text-slate">{t}</span>
                <span className={`mt-1 size-2 rounded-full ${i === 0 ? 'bg-ink' : 'bg-line'}`} aria-hidden="true" />
              </span>
            </li>
          ))}
        </ol>
      </section>

      {editing && editingPerfume && (
        <MemoSheet perfume={editingPerfume} existing={editing} onSave={onSaveEdit} onClose={() => setEditing(null)} />
      )}
      {toast && <Toast message={toast} />}
    </main>
  )
}
