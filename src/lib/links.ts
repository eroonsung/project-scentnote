/** 네이버 지도 검색 링크 (새 탭으로 연다) */
export function naverMapSearchUrl(query: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`
}

/**
 * 브랜드 이름으로는 지도에서 매장이 잡히지 않아 쓰는 공통 검색어.
 * - 백화점 향수: 여러 브랜드 카운터가 있는 백화점 향수 매장이 나온다
 * - 올리브영 향수: 올리브영 브랜드관만 확인된 브랜드용(매장마다 취급 상품이 다르다)
 */
export const GENERIC_STORE_QUERIES = {
  department: '백화점 향수',
  oliveyoung: '올리브영 향수',
} as const

export const isGenericStoreQuery = (query: string) => Object.values<string>(GENERIC_STORE_QUERIES).includes(query)

/** 공통 검색어일 때 카드 뒷면에 보여 주는 안내 */
export function genericStoreNote(query: string): string {
  return query === GENERIC_STORE_QUERIES.oliveyoung
    ? '이 브랜드 이름으로는 지도에서 매장이 바로 잡히지 않아요. 올리브영 매장에서 찾아보세요(매장마다 취급 상품이 달라요).'
    : '이 브랜드 이름으로는 지도에서 매장이 바로 잡히지 않아요. 백화점 향수 매장에서 찾아보세요.'
}
