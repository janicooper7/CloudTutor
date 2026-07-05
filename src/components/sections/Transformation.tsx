import Reveal from "../Reveal";

// A live-lesson moment, then what CloudTutor extracts from it. The point of this
// section: show the *depth* — the small, recurring mistakes a tutor can't jot
// down while teaching — and that the two voices are cleanly separated.

type Turn = { who: "Tutor" | "Student"; text: React.ReactNode };

const transcript: Turn[] = [
  { who: "Tutor", text: "So tell me about your weekend — what did you do?" },
  {
    who: "Student",
    text: (
      <>
        Yesterday I <Mark>go</Mark> to the market and <Mark>buy</Mark> some fish.
      </>
    ),
  },
  { who: "Tutor", text: "Nice! And how was it?" },
  {
    who: "Student",
    text: (
      <>
        Is very crowded. I <Mark>must to wait</Mark> long time.
      </>
    ),
  },
];

const insights = [
  {
    kind: "fix" as const,
    label: "Past simple",
    note: "“I go / buy” → “went / bought” — same slip as lessons 9 and 10.",
  },
  {
    kind: "fix" as const,
    label: "Modal verb",
    note: "“I must to wait” → “I had to wait”.",
  },
  {
    kind: "word" as const,
    label: "crowded",
    note: "Used correctly and unprompted — worth banking.",
  },
  {
    kind: "win" as const,
    label: "Told a story in the past",
    note: "Reached for narrative past tense on their own. Encourage it.",
  },
];

export default function Transformation() {
  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-[1160px] px-8">
        <Reveal className="mb-14 max-w-2xl">
          <div className="text-[.82rem] font-bold uppercase tracking-widest text-brand">
            The part you&apos;d never have time for
          </div>
          <h2 className="mt-4 font-display text-[clamp(2rem,3.8vw,2.9rem)] font-medium tracking-tight">
            It reads every line, so you don&apos;t have to.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            CloudTutor keeps your voice and your student&apos;s cleanly apart, then works
            through the whole conversation — catching the small, recurring mistakes that
            slip past while you&apos;re busy teaching.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
          {/* ---- raw conversation ---- */}
          <Reveal delay={60}>
            <div className="rounded-[22px] border border-line bg-surface p-6 shadow-soft-sm sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[.72rem] font-bold uppercase tracking-[.12em] text-muted">
                  Live lesson · two voices
                </span>
                <span className="inline-flex items-center gap-1.5 text-[.72rem] font-semibold text-muted">
                  <span className="h-2 w-2 animate-pulse-dot rounded-full bg-brand" />
                  captured
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {transcript.map((t, i) => (
                  <div
                    key={i}
                    className={t.who === "Tutor" ? "flex justify-start" : "flex justify-end"}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[.95rem] leading-snug ${
                        t.who === "Tutor"
                          ? "rounded-tl-sm bg-brand-soft text-ink"
                          : "rounded-tr-sm bg-mint/10 text-ink"
                      }`}
                    >
                      <span
                        className={`mb-0.5 block text-[.66rem] font-bold uppercase tracking-wider ${
                          t.who === "Tutor" ? "text-brand-deep" : "text-[#137e70]"
                        }`}
                      >
                        {t.who}
                      </span>
                      {t.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ---- connector ---- */}
          <Reveal delay={140} className="hidden lg:block">
            <div className="flex flex-col items-center gap-2 px-1 text-brand">
              <span className="text-[.7rem] font-bold uppercase tracking-wider text-muted">
                reads it
              </span>
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none" aria-hidden>
                <path
                  d="M2 10h34m0 0-7-6m7 6-7 6"
                  stroke="var(--color-brand)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Reveal>

          {/* ---- extracted insight ---- */}
          <Reveal delay={220}>
            <div className="rounded-[22px] border border-brand-line bg-surface p-6 shadow-soft-md sm:p-7">
              <div className="mb-5 text-[.72rem] font-bold uppercase tracking-[.12em] text-muted">
                What CloudTutor pulled out
              </div>
              <ul className="flex flex-col gap-3.5">
                {insights.map((it, i) => (
                  <Reveal as="li" key={i} delay={300 + i * 90}>
                    <div className="flex items-start gap-3">
                      <InsightIcon kind={it.kind} />
                      <div>
                        <div className="font-semibold text-ink">{it.label}</div>
                        <div className="text-[.9rem] text-ink-soft">{it.note}</div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Mark({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-amber/20 px-1 text-ink decoration-amber/60 underline-offset-2">
      {children}
    </mark>
  );
}

function InsightIcon({ kind }: { kind: "fix" | "word" | "win" }) {
  const map = {
    fix: { bg: "bg-amber/15", fg: "text-amber", glyph: "!" },
    word: { bg: "bg-brand-soft", fg: "text-brand-deep", glyph: "A" },
    win: { bg: "bg-mint/12", fg: "text-[#137e70]", glyph: "✓" },
  }[kind];
  return (
    <span
      className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-[8px] text-[.72rem] font-bold ${map.bg} ${map.fg}`}
    >
      {map.glyph}
    </span>
  );
}
