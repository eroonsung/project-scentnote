import cafe from '../assets/images/scenes/cafe.svg'
import flower from '../assets/images/scenes/flower.svg'
import forest from '../assets/images/scenes/forest.svg'
import fruit from '../assets/images/scenes/fruit.svg'
import laundry from '../assets/images/scenes/laundry.svg'
import sea from '../assets/images/scenes/sea.svg'

/** 향수가 처음인 사람을 위한 "장면 고르기": 장면 하나가 분위기·향기 칩 조합으로 미리 채워진다 */
export interface Scene {
  id: string
  title: string
  /** 한 줄 설명 */
  caption: string
  image: string
  moods: string[]
  objects: string[]
}

export const SCENES: Scene[] = [
  { id: 'forest', title: '비 온 뒤 숲길', caption: '촉촉하고 조용한 나무 냄새', image: forest, moods: ['calm', 'fresh'], objects: ['forest'] },
  { id: 'laundry', title: '갓 세탁한 빨래', caption: '보송하고 깨끗한 햇볕 냄새', image: laundry, moods: ['clean', 'soft'], objects: ['soap'] },
  { id: 'sea', title: '한여름 바닷가', caption: '시원하고 상쾌한 바람', image: sea, moods: ['cool', 'zesty'], objects: ['rain'] },
  { id: 'flower', title: '꽃집 앞 봄날', caption: '사랑스럽고 부드러운 꽃향기', image: flower, moods: ['lovely', 'elegant'], objects: ['flower'] },
  { id: 'cafe', title: '따뜻한 카페', caption: '포근하고 달콤한 오후', image: cafe, moods: ['cozy', 'sweet'], objects: ['vanilla'] },
  { id: 'fruit', title: '햇살 가득 과일 가게', caption: '상큼하고 달콤한 과일', image: fruit, moods: ['zesty', 'sweet'], objects: ['fruit'] },
]
