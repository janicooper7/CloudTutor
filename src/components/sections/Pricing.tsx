import Link from "next/link";
import Reveal from "../Reveal";

const plans = [
  {
    name: "Starter",
    desc: "For tutors trying CloudTutor out.",
    price: "Free",
    per: "",
    features: [
      "4 recorded lessons / month",
      "Student & tutor feedback",
      "PDF export",
      "3 student profiles",
    ],
    cta: "Get started",
    href: "/signup?plan=starter",
    featured: false,
  },
  {
    name: "Pro",
    desc: "For working tutors with a full roster.",
    price: "$19",
    per: "/ month",
    features: [
      "Unlimited recorded lessons",
      "Full student journey & history",
      "Branded PDF + email delivery",
      "Unlimited student profiles",
      "Priority processing",
    ],
    cta: "Start 14-day trial",
    href: "/signup?plan=pro",
    featured: true,
  },
  {
    name: "Studio",
    desc: "For schools & teams of tutors.",
    price: "$49",
    per: "/ month",
    features: [
      "Everything in Pro",
      "Up to 5 tutor seats",
      "Shared student library",
      "Team progress overview",
    ],
    cta: "Contact us",
    href: "/signup?plan=studio",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto w-full max-w-[1160px] px-8">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <div className="text-[.82rem] font-bold uppercase tracking-widest text-brand">
            Pricing
          </div>
          <h2 className="mt-4 font-display text-[clamp(2rem,3.8vw,2.9rem)] font-medium tracking-tight">
            Simple plans that pay for themselves in saved time.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Start free. No card required. Cancel anytime.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-md grid-cols-1 items-start gap-6 md:max-w-none md:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 80}>
              <div
                className={`relative h-full rounded-[22px] bg-surface p-9 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-md ${
                  p.featured
                    ? "border-[1.5px] border-brand shadow-soft-md"
                    : "border border-line shadow-soft-sm"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-deep px-4 py-1 text-[.74rem] font-bold tracking-wide text-white">
                    Most popular
                  </span>
                )}
                <div className="font-display text-[1.35rem] font-semibold">{p.name}</div>
                <div className="mb-5 mt-1.5 min-h-11 text-[.95rem] text-ink-soft">
                  {p.desc}
                </div>
                <div className="mb-6 flex items-baseline gap-1.5">
                  <span className="font-display text-[2.8rem] font-semibold tracking-tight">
                    {p.price}
                  </span>
                  {p.per && <span className="font-medium text-muted">{p.per}</span>}
                </div>
                <ul className="mb-7 flex flex-col gap-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[.96rem] text-ink-soft">
                      <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-[7px] bg-brand-soft text-[.68rem] text-brand-deep">
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={`group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                    p.featured
                      ? "bg-brand-deep text-white"
                      : "border border-brand-line bg-white/60 text-ink hover:border-brand"
                  }`}
                  style={
                    p.featured
                      ? { boxShadow: "0 10px 24px -10px rgba(31,110,224,.7)" }
                      : undefined
                  }
                >
                  {p.cta}
                  {p.featured && (
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  )}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
