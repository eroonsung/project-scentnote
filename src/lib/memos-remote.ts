import type { Memo } from '../types'
import { ensureSession, supabase } from './supabase'

interface Row {
  id: string
  perfume_id: string
  rating: number
  memo: string | null
  created_at: string
}

const toMemo = (r: Row): Memo => ({ id: r.id, perfumeId: r.perfume_id, rating: r.rating, text: r.memo ?? '', createdAt: r.created_at })

/** 내 메모를 서버에서 가져온다. 서버를 못 쓰거나 세션이 없으면 null (오류를 밖으로 던지지 않는다) */
export async function fetchRemote(): Promise<Memo[] | null> {
  if (!supabase || !(await ensureSession(false))) return null
  try {
    const { data, error } = await supabase
      .from('memos')
      .select('id, perfume_id, rating, memo, created_at')
      .order('created_at', { ascending: false })
    return error ? null : (data as Row[]).map(toMemo)
  } catch {
    return null
  }
}

/** 향수당 메모 1개: (user_id, perfume_id)가 같으면 덮어쓴다 */
export async function pushRemote(m: Memo): Promise<boolean> {
  if (!supabase || !(await ensureSession(true))) return false
  try {
    const { error } = await supabase.from('memos').upsert(
      { perfume_id: m.perfumeId, rating: m.rating, memo: m.text, created_at: m.createdAt, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,perfume_id' },
    )
    return !error
  } catch {
    return false
  }
}

export async function deleteRemote(perfumeId: string): Promise<boolean> {
  if (!supabase || !(await ensureSession(false))) return false
  try {
    const { error } = await supabase.from('memos').delete().eq('perfume_id', perfumeId)
    return !error
  } catch {
    return false
  }
}
