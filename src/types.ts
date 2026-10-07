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
export interface Chips { moods: MoodChip[]; objects: ObjectChip[]; avoids: AvoidChip[] }

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
  moods: string[]
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
