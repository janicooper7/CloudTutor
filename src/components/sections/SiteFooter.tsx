import Logo from "../Logo";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line py-14 text-muted">
      <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center justify-between gap-5 px-8">
        <a href="#" className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="font-display text-[1.2rem] font-semibold tracking-tight text-ink">
            CloudTutor
          </span>
        </a>
        <div className="flex gap-6 text-[.95rem]">
          <a href="#how" className="transition-colors hover:text-ink">How it works</a>
          <a href="#pricing" className="transition-colors hover:text-ink">Pricing</a>
          <a href="#" className="transition-colors hover:text-ink">Privacy</a>
          <a href="#" className="transition-colors hover:text-ink">Contact</a>
        </div>
        <div className="text-[.9rem]">© 2026 CloudTutor</div>
      </div>
    </footer>
  );
}
