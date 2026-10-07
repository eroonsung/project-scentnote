export default function Footer() {
  return (
    <footer className="border-t border-line bg-mist">
      <div className="mx-auto flex max-w-[1120px] flex-col justify-between gap-4 px-6 pb-10 pt-[41px] md:flex-row">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase leading-4 tracking-[0.6px] text-slate">
            ARCHIVAL LOG · OLFACTORY DOSSIER
          </p>
          <p className="text-sm leading-[22px] text-slate">
            구매 전, 오프라인 매장에서 실패 없이 시향하는 3단계 큐레이션 가이드
          </p>
        </div>
        <p className="font-mono text-[11px] leading-4 tracking-[0.55px] text-slate">
          © 2026 시향노트 (SCENT NOTE). All rights reserved.
        </p>
      </div>
    </footer>
  )
}
