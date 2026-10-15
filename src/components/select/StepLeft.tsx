import bulb from '../../assets/icons/select/bulb.svg'
import filterNote from '../../assets/icons/select/filter-note.svg'
import noteBook from '../../assets/icons/select/note-book.svg'
import moodForest from '../../assets/images/mood-forest.jpg'
import moodLinen from '../../assets/images/mood-linen.jpg'
import { avoidedCount, chosenFamilies, eunNeun, likedAvoidNotes } from '../../lib/avoid'
import { CHIPS, getFamily, PERFUMES } from '../../lib/perfumes'
import type { Selection } from '../../types'
import { conflictNotice, conflictReason } from '../../lib/chipConflicts'
import { AvoidChip, MoodChip, ScentChip } from './Chips'
import MoodExamples from './MoodExamples'

interface Props {
  selection: Selection
  onToggle: (group: 'moods' | 'objects' | 'avoids', id: string) => void
}

const title = 'text-[32px] font-medium leading-10 tracking-[-1px] text-ink md:text-[40px] md:leading-[52px]'
const lead = 'text-base leading-[26px] tracking-[-0.08px] text-slate'

/** Step 1 왼쪽: 분위기 칩 */
export function MoodStep({ selection, onToggle }: Props) {
  const full = selection.moods.length >= 3
  const notice = conflictNotice(selection.moods)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 pt-1">
        <h1 className={title}>어떤 분위기를 원하세요?</h1>
        <p className={lead}>1~3개 골라 주세요. 나만의 감각적인 언어로 시향을 시작합니다.</p>
      </div>
      <div className="flex flex-wrap gap-3 pt-2" role="group" aria-label="분위기 (1~3개 선택)">
        {CHIPS.moods.map((m) => (
          <MoodChip key={m.id} label={m.label} selected={selection.moods.includes(m.id)} disabled={full} conflict={conflictReason(m.id, selection.moods)} onClick={() => onToggle('moods', m.id)} />
        ))}
      </div>
      {notice.length > 0 && (
        <ul className=" list-disc space-y-0.5 pl-5 text-xs text-slate" role="status">
          {notice.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex gap-3.5 rounded-xl border border-line/60 bg-mist p-[21px]">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line/80 bg-card">
          <img src={bulb} alt="" width={11.25} height={15} />
        </span>
        <div className="flex flex-col gap-1">
          <b className="text-sm font-medium text-ink">분위기 고르는 팁</b>
          <p className="text-sm leading-[22.75px] text-slate">
            일상에서 편안하게 느끼는 공기나 촉각을 떠올려보세요. <b className="font-normal text-ink">비 내린 숲길(차분한)</b>,{' '}
            <b className="font-normal text-ink">빳빳하게 마른 셔츠(보송한)</b>처럼 떠오르는 장면이 선명할수록 매장 직원에게 원하는 향을 설명하기 훨씬 쉬워져요.
          </p>
          <MoodExamples className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { src: moodForest, cap: '예시 · 비 내린 숲길 → 차분한' },
          { src: moodLinen, cap: '예시 · 마른 셔츠 → 보송한' },
        ].map((i) => (
          <figure key={i.cap} className="relative h-28 overflow-hidden rounded-xl border border-line/50 bg-mist">
            <img src={i.src} alt="" className="absolute inset-0 size-full object-cover opacity-75 mix-blend-multiply" loading="lazy" />
            <figcaption className="absolute bottom-3.5 left-3.5 rounded border border-line/60 bg-card/90 px-[11px] pb-2 pt-3 font-mono text-[11px] font-bold leading-4 tracking-[0.55px] text-ink backdrop-blur-[2px]">
              {i.cap}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

/** Step 2 왼쪽: 향기 칩 14개 */
export function ScentStep({ selection, onToggle }: Props) {
  const full = selection.objects.length >= 3
  const picked = selection.objects.map((id) => CHIPS.objects.find((o) => o.id === id)).filter((o) => !!o)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <h1 className={title}>어떤 향기가 좋아요?</h1>
        <p className={`${lead} max-w-[576px]`}>기억에 남거나 평소 마음이 편안해지는 향기를 1~3개 골라 주세요. 전문 조향 용어 대신 일상의 친숙한 감각으로 정리해 드립니다.</p>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-[10px] pt-2" role="group" aria-label="향기 (1~3개 선택)">
        {CHIPS.objects.map((o) => (
          <ScentChip key={o.id} chip={o} selected={selection.objects.includes(o.id)} disabled={full} onClick={() => onToggle('objects', o.id)} />
        ))}
      </div>
      <div className="mt-2 flex gap-4 rounded-xl border border-line bg-mist p-[21px]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-line">
          <img src={noteBook} alt="" width={18.33} height={16.25} />
        </span>
        <div className="flex flex-col gap-[5px]">
          <b className="text-sm font-medium text-ink">향기 고르는 팁</b>
          <p className="text-xs leading-5 text-slate">
            평소 좋아하던 향기를 떠올려 보세요. 샴푸, 과일, 비 온 뒤 공기처럼 익숙한 향이면 충분해요. 똑같지 않아도, 비슷한 느낌의 향수를 찾아 드려요.
          </p>
          {picked.length > 0 && (
            <ul className="mt-1 flex flex-col gap-1 text-sm leading-[22.75px] text-ink">
              {picked.map((o) => {
                const f = getFamily(o.family)
                return (
                  <li key={o.id}>
                    <b className="font-medium">{o.label}</b> ({f?.name} 계열) → {f?.examples} 같은 향이에요.
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

/** Step 3 왼쪽: 피하고 싶은 칩 */
export function AvoidStep({ selection, onToggle, gift }: Props & { gift?: boolean }) {
  const full = selection.avoids.length >= 3
  // 좋아하는 향기와 같은 계열을 피하고 싶다고 고르면, 그 계열은 진한 향만 제외된다는 것을 알려 준다
  const notes = likedAvoidNotes(PERFUMES, selection.avoids, selection.objects)
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className={title}>피하고 싶은 느낌이 있나요?</h1>
        <p className={`${lead} max-w-[576px]`}>
          {gift
            ? '받는 분이 싫어할 만한 향이 있다면 골라 주세요. 없으면 건너뛰어도 괜찮아요.'
            : '없으면 건너뛰어도 괜찮아요. 두통이나 멀미를 유발했던 향의 인상을 미리 걸러내어 편안하게 시향을 시작할 수 있어요.'}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.6px] text-ink">감각적 불호 필터 (택 0 ~ 3개)</span>
          <span className="text-[11px] tracking-[0.55px] text-slate">{selection.avoids.length}개 선택됨</span>
        </div>
        <div className="flex flex-wrap gap-3" role="group" aria-label="피하고 싶은 느낌 (0~3개 선택)">
          {CHIPS.avoids.map((a) => (
            <AvoidChip key={a.id} label={a.label} selected={selection.avoids.includes(a.id)} disabled={full} count={avoidedCount(PERFUMES, a.id, chosenFamilies(selection.objects))} onClick={() => onToggle('avoids', a.id)} />
          ))}
        </div>
        {notes.length > 0 && (
          <ul className="flex flex-col gap-1.5 rounded-xl bg-mist px-4 py-3 text-sm leading-[22px] text-ink" aria-live="polite">
            {notes.map((n) => (
              <li key={`${n.scent}-${n.avoid}`}>
                선호하는 향으로 ‘{n.scent}’ 향기를 골라서, ‘{n.avoid}’{eunNeun(n.avoid)} <b className="font-medium">진한 향만 제외</b>돼요.{' '}
                <span className="text-slate">
                  {n.removed > 0 ? `(${n.pool}개 중 ${n.removed}개가 빠져요)` : '이 향기에는 진한 향이 없어 빠지는 향수는 없어요.'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex gap-4 rounded-card bg-card p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-mist">
          <img src={filterNote} alt="" width={19.8} height={19.8} />
        </span>
        <div className="flex flex-col gap-[3px]">
          <b className="text-sm font-medium text-ink">피하고 싶은 느낌 팁</b>
          <p className="text-sm leading-[22.75px] text-slate">
            싫은 느낌을 골라 두면 그런 향수는 처음부터 결과에서 빠져요. 고르지 않고 건너뛰어도 괜찮아요.
          </p>
        </div>
      </div>
    </div>
  )
}
