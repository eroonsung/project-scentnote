import type { FamilyId, NoteItem, Perfume } from '../../types'

export const INTENSITY_KO = { light: '가벼움', medium: '보통', strong: '진함' } as const
export const POLARIZING_KO = { low: '호불호 적음', mid: '호불호 보통', high: '호불호 있음' } as const

export interface TierInfo {
  key: 'top' | 'middle' | 'base'
  short: 'TOP' | 'MID' | 'BASE'
  title: string
  hint: string
  family: FamilyId
  notes: NoteItem[]
}

/** 탑·미들·베이스 노트를 화면용으로 묶는다. 노트가 비어 있으면 향수의 주 계열 색을 쓴다. */
export function tiersOf(p: Perfume): TierInfo[] {
  const tier = (key: TierInfo['key'], short: TierInfo['short'], title: string, hint: string): TierInfo => {
    const notes = p.notes[key]
    return { key, short, title, hint, family: notes[0]?.family ?? p.family, notes }
  }
  return [
    tier('top', 'TOP', 'TOP · 처음 10~30분', '첫인상'),
    tier('middle', 'MID', 'MIDDLE · 30분~몇 시간', '하트노트'),
    tier('base', 'BASE', 'BASE · 몇 시간 이후', '잔향'),
  ]
}
