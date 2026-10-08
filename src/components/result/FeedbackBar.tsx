import { useState } from 'react'
import { getVote, resultKey, submitFeedback, type FeedbackInput, type Vote } from '../../lib/feedback'

type Base = Omit<FeedbackInput, 'vote'>

/** 결과 화면 아래 "이 추천 어땠어요?" 좋아요/아쉬워요. 선택한 칩과 나온 향수 3개와 함께 저장한다 */
export default function FeedbackBar({ base }: { base: Base }) {
  const key = resultKey(base)
  const [vote, setVote] = useState<Vote | null>(() => getVote(key))

  const onVote = (v: Vote) => {
    setVote(v)
    void submitFeedback({ ...base, vote: v })
  }

  const btn = (v: Vote, label: string, emoji: string) => (
    <button
      type="button"
      aria-pressed={vote === v}
      onClick={() => onVote(v)}
      className={`flex h-12 min-w-[132px] items-center justify-center gap-2 rounded-xl border px-5 text-sm transition-colors ${
        vote === v ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink hover:bg-mist'
      }`}
    >
      <span aria-hidden="true" className="text-base">
        {emoji}
      </span>
      {label}
    </button>
  )

  return (
    <section className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-3 rounded-card border border-line/60 bg-card px-6 py-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]" aria-labelledby="feedback-title">
      <h2 id="feedback-title" className="text-base font-medium tracking-[-0.08px] text-ink">
        이 추천 어땠어요?
      </h2>
      <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="추천에 대한 의견">
        {btn('up', '좋아요', '👍')}
        {btn('down', '아쉬워요', '👎')}
      </div>
      <p className="text-xs text-slate" role="status">
        {vote ? '의견 고마워요! 더 나은 추천을 만드는 데 쓸게요.' : '고른 느낌과 나온 향수 3개만 익명으로 저장돼요.'}
      </p>
    </section>
  )
}
