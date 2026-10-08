import checkGold from '../../assets/icons/select/check-circle-gold.svg'
import chipCheck from '../../assets/icons/select/chip-check.svg'
import xSelected from '../../assets/icons/select/x-selected.svg'
import minusCircle from '../../assets/icons/select/minus-circle.svg'
import { FAMILY_EN } from '../../lib/labels'
import type { ObjectChip as ObjectChipData } from '../../types'

const base =
  'inline-flex min-h-11 items-center gap-2 rounded-chip px-5 text-sm tracking-[-0.35px] transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50'

interface ToggleProps {
  selected: boolean
  disabled?: boolean
  onClick: () => void
}

/** 분위기 칩: 선택하면 잉크 채움 */
export function MoodChip({ label, selected, disabled, conflict, onClick }: ToggleProps & { label: string; conflict?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={conflict ? true : undefined}
      title={conflict}
      disabled={disabled && !selected}
      onClick={conflict ? undefined : onClick}
      className={`${base} border ${
        conflict
          ? 'cursor-not-allowed border-line/50 bg-card text-slate opacity-40'
          : selected
          ? 'border-ink bg-ink text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]'
          : 'border-line bg-card text-ink hover:bg-mist'
      }`}
    >
      {selected ? (
        <img src={checkGold} alt="" width={14.17} height={14.17} />
      ) : (
        <span className="size-1.5 rounded-full bg-line" aria-hidden="true" />
      )}
      {label}
    </button>
  )
}

/** 향기 칩: 계열 색 점 + 영문 이름. 선택하면 계열 tint 배경 */
export function ScentChip({ chip, selected, disabled, onClick }: ToggleProps & { chip: ObjectChipData }) {
  const f = chip.family
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled && !selected}
      onClick={onClick}
      className={`${base} border px-[17px] ${selected ? 'text-ink' : 'border-line/60 bg-card text-ink hover:bg-mist'}`}
      style={
        selected
          ? { background: `var(--${f}-tint)`, borderColor: `color-mix(in srgb, var(--${f}), var(--ink) 30%)` }
          : undefined
      }
    >
      <span className="size-2.5 rounded-full" style={{ background: `var(--${f})` }} aria-hidden="true" />
      {chip.label}
      <span className="font-mono text-[11px] tracking-[0.55px] text-slate">{FAMILY_EN[f]}</span>
      {selected && (
        <span
          aria-hidden="true"
          className="size-[13.33px]"
          style={{
            background: `var(--${f}-deep)`,
            mask: `url(${chipCheck}) center / contain no-repeat`,
            WebkitMask: `url(${chipCheck}) center / contain no-repeat`,
          }}
        />
      )}
    </button>
  )
}

/** 피하고 싶은 칩: 선택하면 X 표시와 EXCLUDED */
export function AvoidChip({ label, selected, disabled, count, onClick }: ToggleProps & { label: string; count?: number }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled && !selected}
      onClick={onClick}
      className={`${base} h-[46px] shadow-[0_1px_1px_rgba(0,0,0,0.05)] ${
        selected ? 'bg-ink text-white' : 'bg-card text-slate hover:bg-mist'
      }`}
    >
      <img src={selected ? xSelected : minusCircle} alt="" width={selected ? 9.33 : 13.33} height={selected ? 9.33 : 13.33} />
      {label}
      {selected ? (
        <span className="font-mono text-[11px] uppercase tracking-[0.55px] text-hint">EXCLUDED</span>
      ) : (
        count !== undefined && <span className="font-mono text-[11px] tracking-[0.55px] text-hint">{count}종</span>
      )}
    </button>
  )
}
