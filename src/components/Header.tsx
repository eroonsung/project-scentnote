import { useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { useSelection } from '../context/SelectionContext'
import { memoCount as readMemoCount, subscribeMemos } from '../lib/storage'
import logo from '../assets/scentnote-logo.svg'
import { useNickname } from '../lib/auth'
import HeaderAccount from './account/HeaderAccount'

export default function Header() {
  const { reset } = useSelection()
  const memoCount = useSyncExternalStore(subscribeMemos, readMemoCount, () => 0)
  const nickname = useNickname()

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-[6px]">
      <div className="mx-auto flex min-h-[72px] max-w-[1120px] flex-wrap items-center justify-between gap-x-3 gap-y-1 px-6 py-2 sm:flex-nowrap sm:gap-x-6 sm:py-0">
        <Link to="/" onClick={reset} className="flex shrink-0 items-center gap-3 whitespace-nowrap" aria-label="시향노트 처음으로">
          <img src={logo} alt="" width={40} height={40} className="size-10" />
          <span className="flex flex-col">
            <span className="text-lg font-medium leading-[26px] tracking-[-0.45px] text-ink">시향노트</span>
            <span className="font-mono text-[11px] uppercase leading-4 tracking-[1.1px] text-slate">SCENT NOTE</span>
          </span>
        </Link>
        <nav className="flex items-center justify-end gap-x-3 sm:ml-auto sm:gap-x-6" aria-label="주요 메뉴">
          <Link to="/notes" className="flex min-h-11 items-center gap-1.5 text-sm text-slate hover:text-ink">
            {nickname ? (
              <span className="max-w-[150px] truncate sm:max-w-[260px]" title={`${nickname}님의 시향노트`}>
                <b className="font-bold text-ink">{nickname}</b>님의 시향노트
              </span>
            ) : (
              '내 시향 노트'
            )}
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
        <span className="hidden h-3 w-px bg-line sm:block" aria-hidden="true" />
        <div className="order-last flex w-full justify-end sm:order-none sm:w-auto">
          <HeaderAccount />
        </div>
      </div>
    </header>
  )
}
