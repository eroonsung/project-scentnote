import type { Memo } from '../types'

const MEMOS_KEY = 'scentnote.memos.v1'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/** 시향 메모 (localStorage 캐시). Supabase 연동은 이 파일을 통해서만 붙인다. */
export function loadMemos(): Memo[] {
  const memos = read<Memo[]>(MEMOS_KEY, [])
  return Array.isArray(memos) ? memos : []
}

export function saveMemos(memos: Memo[]): boolean {
  const ok = write(MEMOS_KEY, memos)
  if (ok) window.dispatchEvent(new Event(MEMOS_EVENT))
  return ok
}

const MEMOS_EVENT = 'scentnote:memos'

/** 메모가 바뀌면 알려 준다 (Header의 메모 개수 배지가 바로 갱신되도록) */
export function subscribeMemos(onChange: () => void): () => void {
  window.addEventListener(MEMOS_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(MEMOS_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function memoCount(): number {
  return loadMemos().length
}
