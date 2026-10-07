import { useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { useSelection } from '../context/SelectionContext'
import { memoCount as readMemoCount, subscribeMemos } from '../lib/storage'
import logo from '../assets/scentnote-logo.svg'

export default function Header() {
  const { reset } = useSelection()
  const memoCount = useSyncExternalStore(subscribeMemos, readMemoCount, () => 0)

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-[6px]">
      <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between px-6">
        <Link to="/" onClick={reset} className="flex items-center gap-3" aria-label="시향노트 처음으로">
          <img src={logo} alt="" width={40} height={40} className="size-10" />
          <span className="flex flex-col">
            <span className="text-lg font-medium leading-[26px] tracking-[-0.45px] text-ink">시향노트</span>
            <span className="font-mono text-[11px] uppercase leading-4 tracking-[1.1px] text-slate">SCENT NOTE</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6" aria-label="주요 메뉴">
          <Link to="/notes" className="flex min-h-11 items-center gap-1.5 text-sm text-slate hover:text-ink">
            내 시향 노트
            {memoCount > 0 && (
              <span className="rounded-full bg-powdery-tint px-1.5 py-0.5 font-mono text-[11px] font-bold leading-[11px] tracking-[0.55px] text-powdery-deep">
                {memoCount}
              </span>
            )}
          </Link>
          <span className="h-3 w-px bg-line" aria-hidden="true" />
          <Link to="/" onClick={reset} className="flex min-h-11 items-center text-sm text-slate hover:text-ink">
            처음으로
          </Link>
        </nav>
      </div>
    </header>
  )
}
