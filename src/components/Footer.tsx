export default function Footer() {
  return (
    <footer className="border-t border-line bg-mist">
      <div className="mx-auto flex max-w-[1120px] flex-col justify-between gap-4 px-6 pb-10 pt-[41px] md:flex-row">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase leading-4 tracking-[0.6px] text-slate">
            SCENT NOTE · 시향노트
          </p>
          <p className="text-sm leading-[22px] text-slate">
            원하는 느낌과 향을 고르면, 맡아볼 향수 3개를 골라드려요.
          </p>
        </div>
        <p className="font-mono text-[11px] leading-4 tracking-[0.55px] text-slate">
          © 2026 내일배움캠프 PM 8기 메이커톤 프로젝트
        </p>
      </div>
    </footer>
  )
}
