import { useState } from 'react'
import { signIn, signUp, NICKNAME_MAX, NICKNAME_RULE } from '../../lib/auth'
import InfoSheet from '../InfoSheet'

type Mode = 'signup' | 'signin'

const input = 'h-12 w-full rounded-xl border border-line bg-card px-4 text-base text-ink outline-none placeholder:text-hint focus:border-ink'

/** 닉네임 만들기 / 로그인 팝업 (닉네임 + 숫자 4자리) */
export default function AuthSheet({ initial, onDone, onClose }: { initial: Mode; onDone: (nickname: string, mode: Mode) => void; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>(initial)
  const [nickname, setNickname] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const switchTo = (m: Mode) => {
    setMode(m)
    setError(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const result = await (mode === 'signup' ? signUp : signIn)(nickname, pin)
    setBusy(false)
    if (result.ok) onDone(nickname.trim(), mode)
    else setError(result.message)
  }

  const tab = (m: Mode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => switchTo(m)}
      className={`h-10 flex-1 rounded-lg text-sm ${mode === m ? 'bg-ink text-white' : 'bg-mist text-slate hover:bg-line/60'}`}
    >
      {label}
    </button>
  )

  return (
    <InfoSheet title={mode === 'signup' ? '닉네임 만들기' : '로그인'} eyebrow="MY SCENT NOTE" onClose={onClose}>
      <div role="tablist" aria-label="닉네임 만들기 또는 로그인" className="mb-5 flex gap-2">
        {tab('signup', '닉네임 만들기')}
        {tab('signin', '로그인')}
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-ink">
          닉네임
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={mode === 'signup' ? NICKNAME_MAX : 12} autoComplete="username" placeholder={NICKNAME_RULE} className={input} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-ink">
          숫자 4자리
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            type="password"
            inputMode="numeric"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder="● ● ● ●"
            className={input}
          />
        </label>
        {mode === 'signup' ? (
          <ul className="list-disc space-y-0.5 pl-5 text-xs leading-[18px] text-slate">
            <li>지금 이 기기에 남긴 시향 노트도 함께 저장돼요.</li>
            <li>숫자 4자리를 잊으면 노트를 되찾을 수 없어요.</li>
            <li>다른 곳에서 쓰는 번호는 쓰지 마세요.</li>
          </ul>
        ) : (
          <p className="text-xs leading-[18px] text-slate">이 기기에 남긴 시향 노트도 이 닉네임에 함께 저장돼요.</p>
        )}
        {error && (
          <p role="alert" className="text-sm text-spicy-deep">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="h-[50px] rounded-xl bg-ink text-sm text-white hover:bg-ink-deep disabled:cursor-not-allowed disabled:bg-hint">
          {busy ? '잠시만요…' : mode === 'signup' ? '닉네임 만들기' : '로그인'}
        </button>
      </form>
    </InfoSheet>
  )
}
