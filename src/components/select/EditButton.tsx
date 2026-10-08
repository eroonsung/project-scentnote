/** 이미 고른 단계로 돌아가 고치는 작은 버튼 */
export default function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="cursor-pointer rounded-full border border-line bg-card px-2.5 py-0.5 text-[11px] tracking-[0.3px] text-ink hover:border-ink">
      수정
    </button>
  )
}
