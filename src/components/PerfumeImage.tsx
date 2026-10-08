import { imageSrc, placeholderSrc } from '../lib/perfumes'
import type { Perfume } from '../types'

/** 향수병 이미지. 이미지가 없거나 깨지면 계열 색 플레이스홀더를 보여준다 */
export default function PerfumeImage({ perfume }: { perfume: Perfume }) {
  const hasReal = !!perfume.image
  return (
    <img
      src={imageSrc(perfume)}
      alt={hasReal ? `${perfume.brandKo} ${perfume.nameKo} 병 이미지` : '향수병 이미지 준비 중'}
      loading="lazy"
      className={`size-full ${hasReal ? 'object-contain' : 'object-cover'}`}
      onError={(e) => {
        const img = e.currentTarget
        img.onerror = null
        img.src = placeholderSrc(perfume.family)
        img.alt = '향수병 이미지 준비 중'
        img.className = 'size-full object-cover'
      }}
    />
  )
}
