import Reveal from "../Reveal";

// NOTE: placeholder figures — swap for real numbers before launch.
const stats = [
  { value: "300+", label: "tutors on board" },
  { value: "12,000+", label: "lessons analyzed" },
  { value: "9 hrs", label: "saved per week" },
  { value: "4.9★", label: "average rating" },
];

export default function TrustBar() {
  return (
    <section className="pb-8 pt-4">
      <div className="mx-auto w-full max-w-[1160px] px-8">
        <Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-soft-sm md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface px-6 py-7 text-center">
                <div className="font-display text-[2.1rem] font-semibold leading-none tracking-tight text-brand-deep">
                  {s.value}
                </div>
                <div className="mt-2 text-sm text-ink-soft">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
