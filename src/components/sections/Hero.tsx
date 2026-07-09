import Link from "next/link";
import Reveal from "../Reveal";
import HeroVisual from "./HeroVisual";
import { avatarUri } from "@/lib/avatar";

const heroFaces = ["Ava tutor", "Marco tutor", "Lena tutor", "Sofia tutor"];

export default function Hero() {
  return (
    <section className="pb-16 pt-20">
      <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 items-center gap-16 px-8 md:grid-cols-[1.05fr_.95fr]">
        {/* copy */}
        <div>
          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-[clamp(2.6rem,5.6vw,4.3rem)] font-medium leading-[1.05] tracking-tight">
              Teach the lesson.{" "}
              <em className="italic text-brand-deep">
                The feedback writes itself.
                <span className="ml-1 inline-block h-[0.82em] w-[3px] translate-y-[0.08em] rounded-sm bg-brand-deep ct-caret align-baseline" />
              </em>
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
        <HeroVisual />
      </div>
    </section>
  );
}
