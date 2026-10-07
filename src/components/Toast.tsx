import toastCheck from '../assets/icons/result/toast-check.svg'

/** 화면 위쪽에 잠깐 뜨는 알림 */
export default function Toast({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-8 z-40 flex justify-center px-4">
      <div className="flex items-center gap-2.5 rounded-full bg-ink px-5 py-2.5 text-sm tracking-[-0.35px] text-white shadow-[0_20px_25px_-5px_rgba(13,8,35,0.2)]">
        <span className="flex size-4 items-center justify-center rounded-full bg-slate">
          <img src={toastCheck} alt="" width={9.7} height={7.4} />
        </span>
        {message}
      </div>
    </div>
  )
}
