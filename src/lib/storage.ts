import { useSyncExternalStore } from 'react'
import type { Memo } from '../types'
import { deleteRemote, fetchRemote, pushRemote } from './memos-remote'

/**
 * 시향 메모 저장소.
 * 화면은 항상 localStorage 캐시를 읽고 쓴다(서버가 느리거나 멈춰도 앱이 돌아가도록).
 * 서버(Supabase)와의 동기화는 뒤에서 조용히 하고, 실패해도 화면을 깨뜨리지 않는다.
 * 컴포넌트는 Supabase를 직접 부르지 않고 이 파일만 거친다.
 */
const MEMOS_KEY = 'scentnote.memos.v1'
const PENDING_DELETE_KEY = 'scentnote.memos.pending-delete.v1'
const MEMOS_EVENT = 'scentnote:memos'

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

// 화면이 바뀐 것을 알아챌 수 있게 같은 배열을 계속 돌려준다 (바뀔 때만 새 배열)
let cache: Memo[] | null = null

function readCache(): Memo[] {
  if (cache === null) {
    const memos = read<Memo[]>(MEMOS_KEY, [])
    cache = Array.isArray(memos) ? memos : []
  }
  return cache
}

function setCache(next: Memo[]): boolean {
  cache = next
  const ok = write(MEMOS_KEY, next)
  window.dispatchEvent(new Event(MEMOS_EVENT))
  return ok
}

export function loadMemos(): Memo[] {
  return readCache()
}

export function subscribeMemos(onChange: () => void): () => void {
  const onStorage = () => {
    cache = null // 다른 탭에서 바뀌었을 수 있으니 다시 읽는다
    onChange()
  }
  window.addEventListener(MEMOS_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(MEMOS_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

export function memoCount(): number {
  return readCache().length
}

/** 메모 목록을 화면에서 쓰는 훅 (저장·삭제·동기화가 되면 자동으로 다시 그려진다) */
export function useMemos(): Memo[] {
  return useSyncExternalStore(subscribeMemos, readCache, () => [])
}

/** 메모 저장(향수당 1개). 브라우저에 먼저 저장하고 서버에는 뒤에서 올린다. 브라우저 저장이 성공했는지 돌려준다. */
export function saveMemo(memo: Memo): boolean {
  const list = readCache()
  const next = list.some((m) => m.perfumeId === memo.perfumeId)
    ? list.map((m) => (m.perfumeId === memo.perfumeId ? memo : m))
    : [memo, ...list]
  const ok = setCache(next)
  removePending(memo.perfumeId)
  void pushRemote(memo)
  return ok
}

export function removeMemo(id: string): boolean {
  const target = readCache().find((m) => m.id === id)
  const ok = setCache(readCache().filter((m) => m.id !== id))
  if (target) {
    void deleteRemote(target.perfumeId).then((done) => {
      if (!done) addPending(target.perfumeId) // 나중에 다시 시도
    })
  }
  return ok
}

const readPending = () => read<string[]>(PENDING_DELETE_KEY, [])
const addPending = (id: string) => write(PENDING_DELETE_KEY, [...new Set([...readPending(), id])])
const removePending = (id: string) => write(PENDING_DELETE_KEY, readPending().filter((x) => x !== id))

let syncing: Promise<void> | null = null

/**
 * 서버와 맞춘다: 지우지 못한 삭제를 다시 시도 → 서버에 없거나 다른 로컬 메모를 올림 → 서버에만 있는 메모를 가져옴.
 * 서버를 못 쓰면 아무것도 바꾸지 않는다.
 */
export function syncMemos(): Promise<void> {
  if (!syncing) {
    syncing = doSync().finally(() => {
      syncing = null
    })
  }
  return syncing
}

async function doSync(): Promise<void> {
  const remote = await fetchRemote()
  if (!remote) return

  for (const perfumeId of readPending()) {
    if (await deleteRemote(perfumeId)) removePending(perfumeId)
  }
  const pending = new Set(readPending())
  const remoteBy = new Map(remote.map((r) => [r.perfumeId, r]))
  const local = readCache()

  for (const l of local) {
    const r = remoteBy.get(l.perfumeId)
    if (!r || r.rating !== l.rating || r.text !== l.text) await pushRemote(l)
  }

  const localIds = new Set(local.map((l) => l.perfumeId))
  const remoteOnly = remote.filter((r) => !localIds.has(r.perfumeId) && !pending.has(r.perfumeId))
  if (remoteOnly.length > 0) {
    setCache([...local, ...remoteOnly].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }
}
