import { useSyncExternalStore } from 'react'
import { clearLocalMemos, syncMemos } from './storage'
import { supabase } from './supabase'

/**
 * 닉네임 + 숫자 4자리(PIN) 로그인 (선택 사항).
 * 안쪽에서는 Supabase 이메일 로그인을 쓴다: 닉네임을 이메일 모양(`u<16진수>@도메인`)으로 바꾸고,
 * PIN에 고정 문자열을 붙여 최소 길이를 채운다. 메일은 보내지 않는다(Supabase에서 "Confirm email"을 꺼야 한다).
 * 로그인하지 않아도 지금처럼 익명으로 쓸 수 있다.
 */
const DOMAIN = 'scentnote.app'
const toEmail = (nickname: string) => {
  const hex = Array.from(new TextEncoder().encode(nickname.trim().toLowerCase()), (b) => b.toString(16).padStart(2, '0')).join('')
  return `u${hex}@${DOMAIN}`
}
const toPassword = (pin: string) => `${pin}-scentnote`

/** 새로 만드는 닉네임의 길이 (이전에 만든 더 긴 닉네임으로도 로그인할 수 있게 로그인은 LOGIN_MAX까지 허용) */
export const NICKNAME_MAX = 8
const LOGIN_MAX = 12
/** 로그인한 채로 이 시간 동안 아무것도 안 하면 자동 로그아웃 */
export const AUTO_LOGOUT_MS = 10 * 60 * 1000
const ACTIVE_KEY = 'scentnote.lastActive.v1'

export function markActive(): void {
  try {
    localStorage.setItem(ACTIVE_KEY, String(Date.now()))
  } catch {
    // 저장소를 못 쓰면 자동 로그아웃 없이 둔다
  }
}

/** 마지막으로 움직인 지 AUTO_LOGOUT_MS가 넘었는지 (기록이 없으면 false) */
export function wasIdleTooLong(): boolean {
  try {
    const last = Number(localStorage.getItem(ACTIVE_KEY))
    return last > 0 && Date.now() - last > AUTO_LOGOUT_MS
  } catch {
    return false
  }
}

export const NICKNAME_RULE = `2~${NICKNAME_MAX}자의 한글·영문·숫자`

export function validateNickname(nickname: string, max = NICKNAME_MAX): string | null {
  const n = nickname.trim()
  if (n.length < 2 || n.length > max) return `닉네임은 2~${max}자로 적어 주세요`
  if (!/^[0-9A-Za-z가-힣_]+$/.test(n)) return '닉네임은 한글·영문·숫자·밑줄(_)만 쓸 수 있어요'
  return null
}

export function validatePin(pin: string): string | null {
  return /^\d{4}$/.test(pin) ? null : '숫자 4자리를 적어 주세요'
}

export type AuthResult = { ok: true } | { ok: false; message: string }

const unavailable: AuthResult = { ok: false, message: '지금은 로그인을 쓸 수 없어요. 잠시 뒤에 다시 해 주세요' }

/** 이 기기의 시향 노트를 새 닉네임에 이어서 저장한다 */
export async function signUp(nickname: string, pin: string): Promise<AuthResult> {
  const bad = validateNickname(nickname) ?? validatePin(pin)
  if (bad) return { ok: false, message: bad }
  if (!supabase) return unavailable
  try {
    await supabase.auth.signOut({ scope: 'local' }) // 익명 세션을 벗어난다 (이 기기의 노트는 브라우저에 남아 있다가 새 계정에 올라간다)
    const { data, error } = await supabase.auth.signUp({
      email: toEmail(nickname),
      password: toPassword(pin),
      options: { data: { nickname: nickname.trim() } },
    })
    if (error) {
      if (/already|registered/i.test(error.message)) return { ok: false, message: '이미 쓰고 있는 닉네임이에요. 다른 닉네임을 써 주세요' }
      if (/rate limit/i.test(error.message)) return { ok: false, message: '잠시 뒤에 다시 시도해 주세요' }
      return { ok: false, message: '닉네임을 만들지 못했어요. 잠시 뒤에 다시 해 주세요' }
    }
    if (!data.session) return { ok: false, message: '로그인 설정이 아직 끝나지 않았어요(메일 확인이 켜져 있어요). 관리자에게 알려 주세요' }
    markActive()
    await syncMemos()
    return { ok: true }
  } catch {
    return unavailable
  }
}

export async function signIn(nickname: string, pin: string): Promise<AuthResult> {
  const bad = validateNickname(nickname, LOGIN_MAX) ?? validatePin(pin)
  if (bad) return { ok: false, message: bad }
  if (!supabase) return unavailable
  try {
    const { error } = await supabase.auth.signInWithPassword({ email: toEmail(nickname), password: toPassword(pin) })
    if (error) {
      if (/invalid login/i.test(error.message)) return { ok: false, message: '닉네임이나 숫자 4자리가 맞지 않아요' }
      if (/rate limit|too many/i.test(error.message)) return { ok: false, message: '시도가 너무 많아요. 잠시 뒤에 다시 해 주세요' }
      return { ok: false, message: '로그인하지 못했어요. 잠시 뒤에 다시 해 주세요' }
    }
    markActive()
    await syncMemos() // 이 기기에서 남긴 노트는 이 닉네임에 함께 저장되고, 닉네임의 노트를 가져온다
    return { ok: true }
  } catch {
    return unavailable
  }
}

/** 로그아웃: 이 기기에 남은 노트를 지워서 다음 사람이 보지 못하게 한다 (노트는 닉네임 계정에 저장돼 있다) */
export async function signOut(): Promise<void> {
  try {
    await supabase?.auth.signOut()
  } finally {
    clearLocalMemos()
    try {
      localStorage.removeItem(ACTIVE_KEY)
    } catch {
      // 저장소를 못 쓰면 그대로 둔다
    }
  }
}

// ---- 지금 로그인한 닉네임 (익명은 null) ----
let nickname: string | null = null
const listeners = new Set<() => void>()

function setNickname(next: string | null) {
  if (next === nickname) return
  nickname = next
  listeners.forEach((l) => l())
}

if (supabase) {
  const apply = (user: { is_anonymous?: boolean; user_metadata?: Record<string, unknown> } | null | undefined) => {
    const n = user && !user.is_anonymous ? user.user_metadata?.nickname : null
    setNickname(typeof n === 'string' ? n : null)
  }
  void supabase.auth.getSession().then(({ data }) => apply(data.session?.user))
  supabase.auth.onAuthStateChange((_event, session) => apply(session?.user))
}

/** 화면에서 로그인한 닉네임을 쓰는 훅. 로그인하지 않았거나 서버를 못 쓰면 null */
export function useNickname(): string | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => nickname,
    () => null,
  )
}

/** 로그인 기능을 쓸 수 있는지 (서버 설정이 있는지) */
export const authAvailable = !!supabase
