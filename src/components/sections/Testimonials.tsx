import Reveal from "../Reveal";

// NOTE: placeholder testimonials — replace with real, consented quotes before launch.
const quotes = [
  {
    quote:
      "It gives my students better feedback than I ever had time to write — and I get my evenings back. The vocabulary lists alone are worth it.",
    name: "Jamie R.",
    role: "English tutor · Preply",
    initial: "J",
  },
  {
    quote:
      "The progress journey is the magic. I open a student's profile and instantly know exactly what to work on next.",
    name: "Sofia M.",
    role: "IELTS coach · Zoom",
    initial: "S",
  },
  {
    quote:
      "Set-up took two minutes and it just works inside my italki lessons. My students love the little PDF after each class.",
    name: "Daniel K.",
    role: "Conversation tutor · italki",
    initial: "D",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-[1160px] px-8">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <div className="text-[.82rem] font-bold uppercase tracking-widest text-brand">
            Loved by tutors
          </div>
          <h2 className="mt-4 font-display text-[clamp(2rem,3.8vw,2.9rem)] font-medium tracking-tight">
            Less admin, better lessons.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Tutors across every major platform use CloudTutor to teach more and type less.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {quotes.map((q, i) => (
            <Reveal key={q.name} delay={i * 80}>
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-surface p-7 shadow-soft-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-md">
                <div className="mb-4 text-brand" aria-hidden>
                  ★★★★★
                </div>
                <blockquote className="flex-1 text-ink">&ldquo;{q.quote}&rdquo;</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                  <span
                    className="grid h-10 w-10 flex-none place-items-center rounded-xl font-display font-semibold text-white"
                    style={{ background: "linear-gradient(145deg,#a9d0f8,#5f9bef)" }}
                  >
                    {q.initial}
                  </span>
                  <div>
                    <div className="font-semibold text-ink">{q.name}</div>
                    <div className="text-sm text-muted">{q.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {/* privacy badge */}
        <Reveal delay={120}>
          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl border border-brand-line bg-brand-soft/50 px-6 py-4 text-center text-sm font-medium text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <Shield /> Audio is never stored — only your notes
            </span>
            <span className="inline-flex items-center gap-2">
              <Shield /> Tutor confirms every note before it&apos;s sent
            </span>
            <span className="inline-flex items-center gap-2">
              <Shield /> GDPR-friendly by design
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Shield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-deep)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
