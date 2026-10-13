export type FamilyId =
  | 'citrus' | 'fruity' | 'aqua' | 'green' | 'aromatic' | 'floral' | 'whiteFloral'
  | 'powdery' | 'musk' | 'spicy' | 'woody' | 'amber' | 'gourmand' | 'leather'

export type Intensity = 'light' | 'medium' | 'strong'
export type Polarizing = 'low' | 'mid' | 'high'
export type Mode = 'self' | 'gift'

export interface Family {
  id: FamilyId
  name: string
  order: number
  examples: string
}

export interface MoodChip { id: string; label: string; affinity: FamilyId[] }
export interface ObjectChip { id: string; label: string; family: FamilyId }
export interface AvoidChip { id: string; label: string }
export interface Chips {
  moods: MoodChip[]
  objects: ObjectChip[]
  avoids: AvoidChip[]
  /** 함께 고르면 어울리지 않는 분위기 칩 id 쌍 */
  conflicts: [string, string][]
}

export interface NoteItem { en: string; ko: string; feel: string; family: FamilyId }

export interface KrPrice { ml: number; krw: number; checkedAt: string | null; source: string | null }

export interface Perfume {
  id: string
  brand: string
  brandKo: string
  name: string
  nameKo: string
  concentration: string | null
  notes: { top: NoteItem[]; middle: NoteItem[]; base: NoteItem[] }
  family: FamilyId
  subFamilies: FamilyId[]
  /** 분위기가 1점 이상인 칩 id (점수 높은 순) */
  moods: string[]
  /** 분위기 정도: 2 = 대표 분위기, 1 = 은은한 분위기 (0은 생략) */
  moodScores?: Record<string, 1 | 2>
  avoidFlags: string[]
  intensity: Intensity
  polarizing: Polarizing
  seasonOccasion: string
  summary: string
  drydown: string
  checkPoint: string
  krPrice: KrPrice | null
  storeQuery: string
  channels: string[]
  image: { file: string; source: string | null } | null
  dataStatus: 'draft' | 'verified'
}

export interface Selection {
  /** 좋아하는 향수로 찾기: 이 향수와 닮은 향을 찾는다 (있으면 분위기·향기 칩은 쓰지 않는다) */
  likedId?: string
  mode: Mode
  moods: string[]
  objects: string[]
  avoids: string[]
  unsure: boolean
}

export interface Memo {
  id: string
  perfumeId: string
  rating: number
  text: string
  createdAt: string
}
