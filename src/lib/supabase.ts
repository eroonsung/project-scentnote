import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** 환경 변수가 없으면 null → 메모는 브라우저(localStorage)에만 저장된다 */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null

/**
 * 익명 로그인 세션을 확인한다 (로그인 화면 없음).
 * create=true일 때만 새 익명 사용자를 만든다 → 메모를 저장하지 않는 방문자는 사용자 기록이 생기지 않는다.
 */
export async function ensureSession(create: boolean): Promise<boolean> {
  if (!supabase) return false
  try {
    const { data } = await supabase.auth.getSession()
    if (data.session) return true
    if (!create) return false
    const { error } = await supabase.auth.signInAnonymously()
    return !error
  } catch {
    return false
  }
}
