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
  return write(MEMOS_KEY, memos)
}
