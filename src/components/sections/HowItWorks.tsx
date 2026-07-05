import Reveal from "../Reveal";

const steps = [
  {
    n: 1,
    title: "Hit record, then forget it",
    body: "Pick the student in the extension and start. No bot joins your call — then teach exactly how you always do.",
  },
  {
    n: 2,
    title: "It listens & separates",
    body: "CloudTutor captures the conversation and cleanly tells your voice apart from your student's — no diarization guesswork.",
  },
  {
    n: 3,
    title: "The draft writes itself",
    body: "Vocabulary in context, mistakes caught, next-lesson plan — written against everything the student has done so far. You type nothing.",
  },
  {
    n: 4,
    title: "Review & send",
    body: "Tweak anything, confirm, and email a clean PDF. The audio is discarded — only your notes are kept.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-24">
      <div className="mx-auto w-full max-w-[1160px] px-8">
        <Reveal className="mb-14 max-w-2xl">
          <div className="text-[.82rem] font-bold uppercase tracking-widest text-brand">
            How it works
          </div>
          <h2 className="mt-4 font-display text-[clamp(2rem,3.8vw,2.9rem)] font-medium tracking-tight">
            From live lesson to polished feedback, automatically.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Start your lesson as usual. CloudTutor handles the rest and hands you a draft
            the moment you hang up.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <div className="group h-full rounded-[22px] border border-line bg-surface p-7 shadow-soft-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-line hover:shadow-soft-md">
                <div className="mb-5 grid h-[42px] w-[42px] place-items-center rounded-[13px] bg-brand-soft font-display text-lg font-semibold text-brand-deep">
                  {s.n}
                </div>
                <h3 className="mb-2 font-display text-xl font-medium">{s.title}</h3>
                <p className="text-[.98rem] text-ink-soft">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
