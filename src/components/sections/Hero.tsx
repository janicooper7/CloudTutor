import Link from "next/link";
import Reveal from "../Reveal";
import { avatarUri } from "@/lib/avatar";

const heroFaces = ["Ava tutor", "Marco tutor", "Lena tutor", "Sofia tutor"];

function Chip({ children, tone = "brand" }: { children: React.ReactNode; tone?: "brand" | "mint" }) {
  const styles =
    tone === "mint"
      ? "bg-mint/12 text-[#137e70] border-mint/25"
      : "bg-brand-soft text-brand-deep border-brand-line";
  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5 ${styles}`}
    >
      {children}
    </span>
  );
}

export default function Hero() {
  return (
    <section className="pb-16 pt-20">
      <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 items-center gap-16 px-8 md:grid-cols-[1.05fr_.95fr]">
        {/* copy */}
        <div>
          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-[clamp(2.6rem,5.6vw,4.3rem)] font-medium leading-[1.05] tracking-tight">
              Teach the lesson.{" "}
              <em className="italic text-brand-deep">The feedback writes itself.</em>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 max-w-[36ch] text-xl text-ink-soft">
              CloudTutor listens in on your English lessons — Meet, Zoom, Preply, italki,
              any browser call — and turns each one into finished feedback: vocabulary in
              context, the mistakes you&apos;d never catch mid-lesson, and a progress plan
              for every student. You just review and send.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-deep px-7 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{ boxShadow: "0 10px 24px -10px rgba(31,110,224,.7)" }}
              >
                Start free trial
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-white/60 px-7 py-3.5 font-semibold text-ink backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brand"
              >
                ▶ See how it works
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-8 flex items-center gap-3.5 text-[.92rem] text-muted">
              <div className="flex">
                {heroFaces.map((seed, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={seed}
                    src={avatarUri(seed)}
                    alt=""
                    width={34}
                    height={34}
                    className="-ml-2.5 h-[34px] w-[34px] rounded-full border-2 border-bg bg-brand-soft first:ml-0"
                    style={{ zIndex: heroFaces.length - i }}
                  />
                ))}
              </div>
              Loved by tutors who&apos;d rather teach than type up notes.
            </div>
          </Reveal>
        </div>

        {/* visual */}
        <Reveal delay={160} className="relative">
          <div className="relative">
            {/* stacked "past lessons" behind — hints at the running history */}
            <div
              aria-hidden
              className="absolute inset-x-5 -top-3 h-40 rounded-[26px] border border-line bg-white/55 shadow-soft-sm"
            />
            <div
              aria-hidden
              className="absolute inset-x-2.5 -top-1.5 h-40 rounded-[26px] border border-line bg-white/80 shadow-soft-sm"
            />

            {/* floating "captured hands-free" cue — the automation, made visible */}
            <div className="absolute -left-5 top-[34%] z-20 hidden animate-float-slow items-center gap-2.5 rounded-2xl border border-line bg-white px-3.5 py-2.5 shadow-soft-md sm:flex">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-soft text-brand-deep">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0M12 17v4" />
                </svg>
              </span>
              <div className="pr-1">
                <div className="text-[.74rem] font-bold leading-tight text-ink">Lesson captured</div>
                <div className="text-[.66rem] text-muted">Meet · 50 min · hands-free</div>
              </div>
            </div>

            <div className="relative z-10 animate-float overflow-hidden rounded-[26px] border border-line bg-white shadow-soft-lg">
              {/* ruled paper */}
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  background:
                    "repeating-linear-gradient(to bottom, transparent 0, transparent 33px, var(--color-line) 33px, var(--color-line) 34px)",
                }}
              />
              {/* margin line */}
              <div className="pointer-events-none absolute bottom-0 left-[60px] top-0 w-px bg-amber/45" />

              <div className="relative p-6 pl-[78px]">
                {/* header */}
                <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-[13px] font-display font-semibold text-white" style={{ background: "linear-gradient(145deg,#a9d0f8,#5f9bef)" }}>
                      M
                    </div>
                    <div>
                      <div className="font-bold leading-tight">Maria S.</div>
                      <div className="text-[.82rem] text-muted">Lesson 12 · 2 Jul · 50 min</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/12 px-2.5 py-1 text-[.72rem] font-bold text-[#137e70]">
                      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-mint" /> Draft ready
                    </span>
                    <span className="rounded-full bg-brand-soft px-3 py-1 text-[.78rem] font-semibold text-brand-deep">
                      B1 → B2
                    </span>
                  </div>
                </div>

                <SectionLabel>New vocabulary</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  <Chip>to negotiate</Chip>
                  <Chip>deadline</Chip>
                  <Chip>on second thought</Chip>
                  <Chip>to postpone</Chip>
                </div>

                <SectionLabel>Went well</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  <Chip tone="mint">Past-tense accuracy</Chip>
                  <Chip tone="mint">Confident small talk</Chip>
                </div>

                <SectionLabel>Areas to improve</SectionLabel>
                <FocusRow>Articles before abstract nouns (&ldquo;the advice&rdquo; → &ldquo;advice&rdquo;)</FocusRow>
                <FocusRow>/θ/ sound in &ldquo;think&rdquo;, &ldquo;through&rdquo;</FocusRow>

                {/* outcome: what you actually do — review & send */}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
                  <span className="text-[.78rem] text-muted">Builds on 11 past lessons</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-deep px-4 py-2 text-[.8rem] font-semibold text-white shadow-soft-sm">
                    Send recap
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Written the moment your lesson ended — you just review and send.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-3 mt-5 font-sans text-[.78rem] font-bold uppercase tracking-wider text-muted first:mt-1">
      {children}
    </h4>
  );
}

function FocusRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5 text-[.92rem] text-ink-soft">
      <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-[7px] bg-amber/15 text-[.7rem] text-amber">
        !
      </span>
      {children}
    </div>
  );
}
