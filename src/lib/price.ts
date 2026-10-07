import type { Perfume } from '../types'

export interface DisplayPrice {
  /** 굵게 보여줄 가격 줄 */
  main: string
  /** 기준일·출처 (가격이 있을 때만) */
  note: string | null
  hasPrice: boolean
}

/** "2026-10-07" → "2026.10" */
function ym(date: string | null): string | null {
  const m = date?.match(/^(\d{4})-(\d{2})/)
  return m ? `${m[1]}.${m[2]}` : null
}

/** 가격 표시는 항상 이 함수로만 만든다 (국내 정가 + 용량 + 기준일, 없으면 안내 문구) */
export function formatPrice(p: Perfume): DisplayPrice {
  const kr = p.krPrice
  if (!kr) return { main: '가격은 매장에서 확인해 보세요', note: null, hasPrice: false }
  const when = ym(kr.checkedAt)
  return {
    main: `${kr.ml}ml ${kr.krw.toLocaleString('ko-KR')}원`,
    note: when ? `${when} 공식몰 기준` : '공식몰 기준',
    hasPrice: true,
  }
}
