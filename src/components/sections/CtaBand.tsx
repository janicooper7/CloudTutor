import Link from "next/link";
import Reveal from "../Reveal";

export default function CtaBand() {
  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-[1160px] px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] border border-line bg-surface px-10 py-18 text-center shadow-soft-md">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(50% 80% at 50% -10%, rgba(93,161,240,.18), transparent 60%)",
              }}
            />
            <h2 className="relative font-display text-[clamp(2rem,4vw,3rem)] font-medium tracking-tight">
              Give every student better feedback — in less time.
            </h2>
            <p className="relative mx-auto mt-4 max-w-[46ch] text-lg text-ink-soft">
              Spend your energy teaching. Let CloudTutor remember, write, and track the
              rest.
            </p>
            <Link
              href="/signup"
              className="group relative mt-8 inline-flex items-center gap-2 rounded-full bg-brand-deep px-7 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
              style={{ boxShadow: "0 10px 24px -10px rgba(31,110,224,.7)" }}
            >
              Start free trial
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
