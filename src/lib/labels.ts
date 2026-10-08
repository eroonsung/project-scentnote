import type { FamilyId } from '../types'

/** 향기 칩에 함께 보여주는 영문 이름 */
export const FAMILY_EN: Record<FamilyId, string> = {
  citrus: 'Citrus', fruity: 'Fruity', aqua: 'Aqua', green: 'Green', aromatic: 'Aromatic',
  floral: 'Floral', whiteFloral: 'White Floral', powdery: 'Powdery', musk: 'Musk', spicy: 'Spicy',
  woody: 'Woody', amber: 'Amber', gourmand: 'Gourmand', leather: 'Smoky',
}

/** 선택한 향 계열을 시향 순서 문장으로 풀어 쓸 때 쓰는 짧은 표현 */
export const FAMILY_PHRASE: Record<FamilyId, string> = {
  citrus: '상큼한 시트러스', fruity: '달콤한 과일', aqua: '청량한 아쿠아', green: '싱그러운 그린',
  aromatic: '차분한 허브', floral: '부드러운 꽃', whiteFloral: '진한 하얀 꽃', powdery: '보송한 파우더',
  musk: '포근한 코튼 머스크', spicy: '알싸한 스파이시', woody: '정적인 우디', amber: '따뜻한 앰버',
  gourmand: '달콤한 구르망', leather: '스모키 레더',
}

export const TIER_LABELS = ['01 TOP', '02 HEART', '03 BASE'] as const

/** 피하고 싶은 칩을 골랐을 때 보여주는 설명 */
export const AVOID_HINT: Record<string, string> = {
  tooSweet: '달콤한 향 제외',
  tooStrong: '진한 향 제외',
  headache: '머리 아플 수 있는 향 제외',
  heavyFloral: '꽃향이 강한 향 제외',
  smoky: '스모키한 향 제외',
  powdery: '화장품 파우더 향 제외',
  spicy: '알싸한 향 제외',
  soapy: '비누·세제 같은 향 제외',
}

/** 분위기 칩 예시: 일상 장면으로 풀어 쓴 설명 ("분위기 예시 보기" 팝업) */
export const MOOD_EXAMPLES: Record<string, string[]> = {
  calm: ['비 내린 숲길', '조용한 도서관'],
  clean: ['갓 세탁한 흰 수건', '샤워 직후'],
  cool: ['바닷바람', '민트 잎을 막 씹은 입안'],
  cozy: ['이불 속', '따뜻한 니트'],
  fresh: ['아침 풀밭', '갓 자른 허브'],
  zesty: ['막 짜낸 레몬즙', '여름 오렌지'],
  warm: ['모닥불 옆', '따뜻한 차 한 잔'],
  sweet: ['갓 구운 쿠키', '바닐라 라떼'],
  lovely: ['꽃다발', '봄날 벚꽃'],
  elegant: ['호텔 로비', '실크 스카프'],
  deep: ['오래된 서재', '가죽 소파'],
  sensual: ['붉은 장미', '한밤의 재즈 바'],
  soft: ['빳빳하게 마른 셔츠', '베이비파우더'],
}
