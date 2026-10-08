import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Mode, Selection } from '../types'

type ChipGroup = 'moods' | 'objects' | 'avoids'

interface SelectionValue {
  selection: Selection
  setMode: (mode: Mode) => void
  toggle: (group: ChipGroup, id: string, max: number) => void
  clear: (group: ChipGroup) => void
  setUnsure: (unsure: boolean) => void
  /** 분위기·향기를 한꺼번에 채운다 (장면 고르기). 나를 위한 향수 모드로 시작 */
  applyPreset: (moods: string[], objects: string[]) => void
  reset: () => void
}

const INITIAL: Selection = { mode: 'self', moods: [], objects: [], avoids: [], unsure: false }

const SelectionContext = createContext<SelectionValue | null>(null)

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<Selection>(INITIAL)

  const setMode = useCallback((mode: Mode) => setSelection({ ...INITIAL, mode }), [])

  const toggle = useCallback((group: ChipGroup, id: string, max: number) => {
    setSelection((prev) => {
      const current = prev[group]
      if (current.includes(id)) return { ...prev, [group]: current.filter((x) => x !== id) }
      if (current.length >= max) return prev
      return { ...prev, [group]: [...current, id], ...(group === 'moods' ? { unsure: false } : {}) }
    })
  }, [])

  const clear = useCallback((group: ChipGroup) => setSelection((prev) => ({ ...prev, [group]: [] })), [])

  const setUnsure = useCallback((unsure: boolean) => {
    setSelection((prev) => ({ ...prev, unsure, moods: unsure ? [] : prev.moods }))
  }, [])

  const applyPreset = useCallback((moods: string[], objects: string[]) => {
    setSelection({ ...INITIAL, mode: 'self', moods, objects })
  }, [])

  const reset = useCallback(() => setSelection(INITIAL), [])

  const value = useMemo(
    () => ({ selection, setMode, toggle, clear, setUnsure, applyPreset, reset }),
    [selection, setMode, toggle, clear, setUnsure, applyPreset, reset],
  )
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSelection(): SelectionValue {
  const ctx = useContext(SelectionContext)
  if (!ctx) throw new Error('useSelection은 SelectionProvider 안에서만 쓸 수 있어요')
  return ctx
}
