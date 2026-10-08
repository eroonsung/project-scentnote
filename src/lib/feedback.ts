import type { Selection } from '../types'
import { ensureSession, supabase } from './supabase'

export type Vote = 'up' | 'down'

export interface FeedbackInput {
  vote: Vote
  mode: Selection['mode']
  moods: string[]
  objects: string[]
  avoids: string[]
  unsure: boolean
  perfumeIds: string[]
}

interface Stored {
  vote: Vote
  /** 서버에 올렸는지 */
  sent: boolean
  input: FeedbackInput
}

const KEY = 'scentnote.feedback.v1'

function load(): Record<string, Stored> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, Stored>
  } catch {
    return {}
  }
}

function save(all: Record<string, Stored>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    // 저장소를 못 쓰면 이번 화면에서만 동작한다
  }
}

/** 같은 선택·같은 추천 3개이면 같은 키 → 같은 사람이 다시 누르면 의견이 바뀐다 */
export function resultKey(input: Omit<FeedbackInput, 'vote'>): string {
  return [input.mode, input.moods.join(','), input.objects.join(','), input.avoids.join(','), input.unsure ? 'u' : '', input.perfumeIds.join(',')].join('|')
}

export function getVote(key: string): Vote | null {
  return load()[key]?.vote ?? null
}

async function push(key: string, s: Stored): Promise<boolean> {
  if (!supabase || !(await ensureSession(true))) return false
  try {
    const i = s.input
    const { error } = await supabase.from('feedback').upsert(
      { result_key: key, vote: s.vote, mode: i.mode, moods: i.moods, objects: i.objects, avoids: i.avoids, unsure: i.unsure, perfume_ids: i.perfumeIds, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,result_key' },
    )
    return !error
  } catch {
    return false
  }
}

/** 의견을 브라우저에 저장하고 서버에 올린다. 서버가 안 되면 나중에 다시 올린다 */
export async function submitFeedback(input: FeedbackInput): Promise<void> {
  const key = resultKey(input)
  const all = load()
  all[key] = { vote: input.vote, sent: false, input }
  save(all)
  const ok = await push(key, all[key])
  if (ok) {
    const now = load()
    if (now[key]) {
      now[key].sent = true
      save(now)
    }
  }
}

/** 서버에 못 올린 의견을 다시 올린다 */
export async function syncFeedback(): Promise<void> {
  const all = load()
  for (const [key, s] of Object.entries(all)) {
    if (s.sent) continue
    if (await push(key, s)) {
      const now = load()
      if (now[key]) {
        now[key].sent = true
        save(now)
      }
    }
  }
}
