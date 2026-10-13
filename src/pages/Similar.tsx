import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PerfumeImage from '../components/PerfumeImage'
import { useSelection } from '../context/SelectionContext'
import { PERFUMES } from '../lib/perfumes'
import type { Mode, Perfume } from '../types'

const norm = (s: string) => s.toLowerCase().replace(/[\s·\-.&'’]/g, '')

/** 좋아하는 향수로 찾기: 아는 향수를 고르면 닮은 향 3개를 맡는 순서로 알려 준다 (D-53) */
export default function Similar() {
  const { setLiked } = useSelection()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Perfume | null>(null)
  const [who, setWho] = useState<Mode>('self')

  const results = useMemo(() => {
    const q = norm(query)
    if (!q) return []
    return PERFUMES.filter((p) => norm(`${p.brandKo}${p.nameKo}${p.brand}${p.name}`).includes(q)).slice(0, 8)
  }, [query])

  const go = () => {
    if (!picked) return
    setLiked(picked.id, who)
    navigate('/result')
  }

  return (
    <main className="mx-auto flex max-w-[720px] flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[1.1px] text-slate">LIKE · 좋아하는 향수로 찾기</p>
        <h1 className="text-[32px] font-medium leading-10 tracking-[-1px] text-ink md:text-[40px] md:leading-[52px]">어떤 향수를 좋아하세요?</h1>
        <p className="text-base leading-[26px] tracking-[-0.08px] text-slate">
          느낌을 말로 설명하기 어렵다면, 이미 아는 향수로 찾아도 돼요. 닮은 향 3개를 가벼운 향부터 맡는 순서로 알려 드려요. 선물할 사람이 쓰는 향수도 괜찮아요.
        </p>
      </header>

      <section className="flex flex-col gap-3" aria-label="향수 검색">
        <label htmlFor="similar-search" className="text-sm font-medium text-ink">
          향수 이름이나 브랜드
        </label>
        <input
          id="similar-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPicked(null)
          }}
          placeholder="예: 르 말, 조 말론, 상탈 33"
          autoComplete="off"
          className="h-[52px] rounded-btn border border-line bg-card px-4 text-base text-ink outline-none placeholder:text-hint focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-ink"
        />

        {query.trim() && !picked && (
          <ul className="flex flex-col overflow-hidden rounded-card border border-line bg-card">
            {results.length === 0 ? (
              <li className="p-4 text-sm leading-[22px] text-slate">
                찾는 향수가 아직 목록에 없어요. 대신{' '}
                <Link to="/select?mode=self" className="font-medium text-ink underline">
                  느낌 칩으로 찾아보세요
                </Link>
                .
              </li>
            ) : (
              results.map((p) => (
                <li key={p.id} className="border-b border-line/60 last:border-b-0">
                  <button type="button" onClick={() => setPicked(p)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-mist">
                    <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-mist">
                      <PerfumeImage perfume={p} />
                    </span>
                    <span className="flex flex-col">
                      <b className="text-sm font-medium text-ink">{p.nameKo}</b>
                      <span className="text-xs text-slate">
                        {p.brandKo}
                        {p.concentration ? ` · ${p.concentration}` : ''}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
        {!query.trim() && <p className="text-xs leading-[18px] text-slate">향수 {PERFUMES.length}개 중에서 찾을 수 있어요. 없는 향수는 느낌 칩으로 찾아보세요.</p>}
      </section>

      {picked && (
        <section className="flex flex-col gap-5 rounded-card border border-line bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]" aria-label="선택한 향수">
          <div className="flex items-center gap-4">
            <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-mist">
              <PerfumeImage perfume={picked} />
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-slate">이 향수와 닮은 향을 찾을게요</span>
              <b className="text-lg font-medium leading-[26px] text-ink">{picked.nameKo}</b>
              <span className="text-sm text-slate">{picked.brandKo}</span>
            </div>
            <button type="button" onClick={() => setPicked(null)} className="ml-auto text-sm text-slate underline">
              다시 고르기
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">누가 쓸 향수인가요?</span>
            <div className="flex gap-2" role="group" aria-label="누가 쓸 향수인가요?">
              {(
                [
                  ['self', '나를 위해'],
                  ['gift', '선물용'],
                ] as const
              ).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={who === m}
                  onClick={() => setWho(m)}
                  className={`h-11 rounded-btn px-5 text-sm ${who === m ? 'bg-ink text-white' : 'border border-line bg-card text-ink hover:bg-mist'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs leading-[18px] text-slate">선물용이면 호불호가 적은 향을 조금 더 앞세워요.</p>
          </div>

          <button type="button" onClick={go} className="inline-flex h-[52px] items-center justify-center gap-2 rounded-btn bg-ink px-8 text-base text-white hover:bg-ink-deep">
            닮은 향 보기 <span aria-hidden="true" className="text-[11px]">→</span>
          </button>
        </section>
      )}
    </main>
  )
}
