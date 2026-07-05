const platforms = [
  "Google Meet",
  "Zoom",
  "Preply",
  "italki",
  "Cambly",
  "Microsoft Teams",
  "Skype",
];

export default function PlatformStrip() {
  return (
    <div className="py-11">
      <div className="mx-auto w-full max-w-[1160px] px-8 text-center">
        <p className="text-[.95rem] font-semibold text-ink-soft">
          Works with any lesson in your browser — no bots, no awkward join links.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {platforms.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-line"
            >
              {p}
            </span>
          ))}
          <span className="inline-flex items-center rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-deep">
            + more
          </span>
        </div>
      </div>
    </div>
  );
}
