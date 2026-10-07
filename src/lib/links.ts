/** 네이버 지도 검색 링크 (새 탭으로 연다) */
export function naverMapSearchUrl(query: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`
}
