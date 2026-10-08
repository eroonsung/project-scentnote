import { useState } from 'react'
import { authAvailable, signOut, useNickname } from '../../lib/auth'
import AuthSheet from './AuthSheet'

/** 내 시향 노트 위쪽: 닉네임으로 어디서나 보기(선택). 로그인하지 않아도 지금처럼 쓸 수 있다 */
export default function AccountBar({ onNotify }: { onNotify: (message: string) => void }) {
  const nickname = useNickname()
  const [sheet, setSheet] = useState<'signup' | 'signin' | null>(null)
  if (!authAvailable) return null

  const done = (name: string, mode: 'signup' | 'signin') => {
    setSheet(null)
    onNotify(mode === 'signup' ? `${name}님의 시향 노트를 만들었어요` : `${name}님, 다시 만나서 반가워요`)
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-line/60 bg-mist px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        {nickname ? (
          <>
            <p className="text-sm text-ink">
              <b className="font-bold">{nickname}</b>님의 시향 노트예요. 다른 기기에서도 닉네임으로 로그인하면 볼 수 있어요.
            </p>
            <button
              type="button"
              onClick={() => void signOut().then(() => onNotify('로그아웃했어요'))}
              className="h-10 shrink-0 rounded-lg border border-line bg-card px-4 text-sm text-ink hover:bg-mist"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-ink">
              <b className="font-medium">닉네임을 만들면</b> 다른 기기에서도 내 시향 노트를 볼 수 있어요. <span className="text-slate">(안 만들어도 지금처럼 쓸 수 있어요)</span>
            </p>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => setSheet('signup')} className="h-10 rounded-lg bg-ink px-4 text-sm text-white hover:bg-ink-deep">
                닉네임 만들기
              </button>
              <button type="button" onClick={() => setSheet('signin')} className="h-10 rounded-lg border border-line bg-card px-4 text-sm text-ink hover:bg-mist">
                로그인
              </button>
            </div>
          </>
        )}
      </div>
      {sheet && <AuthSheet initial={sheet} onDone={done} onClose={() => setSheet(null)} />}
    </>
  )
}
