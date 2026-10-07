import { CHIPS } from './perfumes'

/**
 * 이미 고른 분위기 중에 이 칩과 어울리지 않는 것이 있으면 그 칩 id를 돌려준다. 없으면 null.
 * (예: '시원한'을 골랐으면 '묵직한'은 어울리지 않는다)
 */
export function conflictingSelected(chipId: string, selectedIds: string[]): string | null {
  for (const [a, b] of CHIPS.conflicts) {
    if (a === chipId && selectedIds.includes(b)) return b
    if (b === chipId && selectedIds.includes(a)) return a
  }
  return null
}

/** 마지막 글자에 받침이 있으면 withBatchim, 없으면 without */
const josa = (word: string, withBatchim: string, without: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code % 28 !== 0 ? withBatchim : without
}

/** 흐리게 보이는 칩마다 한 줄: "'따뜻한'과 어울리지 않아 '시원한'을 고를 수 없어요". 없으면 빈 배열 */
export function conflictNotice(selectedIds: string[]): string[] {
  const label = (id: string) => CHIPS.moods.find((m) => m.id === id)?.label ?? id
  const lines: string[] = []
  for (const m of CHIPS.moods) {
    if (selectedIds.includes(m.id)) continue
    const blocker = conflictingSelected(m.id, selectedIds)
    if (!blocker) continue
    const a = label(blocker)
    lines.push(`'${a}'${josa(a, '과', '와')} 어울리지 않아 '${m.label}'${josa(m.label, '을', '를')} 고를 수 없어요`)
  }
  return lines
}

/** 흐리게 보이는 칩에 붙는 이유 한 줄. 어울리지 않는 선택이 없으면 undefined */
export function conflictReason(chipId: string, selectedIds: string[]): string | undefined {
  if (selectedIds.includes(chipId)) return undefined
  const blocker = conflictingSelected(chipId, selectedIds)
  if (!blocker) return undefined
  const label = CHIPS.moods.find((m) => m.id === blocker)?.label ?? blocker
  return `'${label}'과(와) 함께 고르기 어려운 분위기예요`
}
