import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AUTO_LOGOUT_MS, authAvailable, markActive, signOut, useNickname, wasIdleTooLong } from '../../lib/auth'
import Toast from '../Toast'
import AuthSheet from './AuthSheet'

/** 헤더 오른쪽: 로그인하지 않았으면 [로그인], 했으면 [로그아웃] (닉네임은 "○○님의 시향노트" 링크로 보인다). 오래 안 쓰면 자동 로그아웃 */
export default function HeaderAccount() {
  const nickname = useNickname()
  const [sheet, setSheet] = useState<'signup' | 'signin' | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  // 로그인한 채로 오래 아무것도 안 하면 자동으로 로그아웃한다 (이 기기에 남은 노트도 지운다)
  useEffect(() => {
    if (!nickname) return
    const logoutIfIdle = () => {
      if (wasIdleTooLong()) void signOut().then(() => notify('오랫동안 사용하지 않아 로그아웃했어요'))
    }
    logoutIfIdle() // 열어 둔 채 시간이 지났거나 다시 들어왔을 때
    let last = 0
    const onActivity = () => {
      const now = Date.now()
      if (now - last > 10_000) {
        last = now
        markActive()
      }
    }
    markActive()
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
    window.addEventListener('visibilitychange', logoutIfIdle)
    const timer = window.setInterval(logoutIfIdle, Math.min(30_000, AUTO_LOGOUT_MS / 4))
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity))
      window.removeEventListener('visibilitychange', logoutIfIdle)
      window.clearInterval(timer)
    }
    // notify는 매번 새로 만들어지지만 타이머 안에서만 쓰므로 의존성에 넣지 않는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nickname])

  if (!authAvailable) return null

  const notify = (message: string) => {
    setToast(message)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 2600)
  }

  const done = (name: string, mode: 'signup' | 'signin') => {
    setSheet(null)
    notify(mode === 'signup' ? `${name}님의 시향 노트를 만들었어요` : `${name}님, 다시 만나서 반가워요`)
  }

  const small = 'flex h-9 items-center rounded-lg px-3 text-[13px] tracking-[-0.08px]'

  return (
    <>
      {nickname ? (
        <button type="button" onClick={() => void signOut().then(() => notify('로그아웃했어요'))} className={`${small} border border-line bg-card text-ink hover:bg-mist`}>
          로그아웃
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSheet('signin')} className={`${small} border border-line bg-card text-ink hover:bg-mist`}>
            로그인
          </button>
        </div>
      )}
      {sheet && <AuthSheet initial={sheet} onDone={done} onClose={() => setSheet(null)} />}
      {toast && createPortal(<Toast message={toast} />, document.body)}
    </>
  )
}
