"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "../Reveal";

type Plan = {
  name: string;
  desc: string;
  monthly: number | null; // null = free plan
  lessons: string;
  features: string[];
  cta: string;
  plan: string;
  featured: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    desc: "For tutors trying CloudTutor out.",
    monthly: null,
    lessons: "4 lessons / mo",
    features: ["Student & tutor feedback", "PDF export", "3 student profiles"],
    cta: "Get started",
    plan: "free",
    featured: false,
  },
  {
    name: "Starter",
    desc: "Your part-time roster, a few lessons a week.",
    monthly: 12,
    lessons: "Up to 40 lessons / mo",
    features: [
      "Everything in Free",
      "Full student journey & history",
      "Branded PDF + email delivery",
      "Unlimited student profiles",
    ],
    cta: "Choose Starter",
    plan: "starter",
    featured: false,
  },
  {
    name: "Pro",
    desc: "For committed tutors teaching most days.",
    monthly: 29,
    lessons: "Up to 120 lessons / mo",
    features: [
      "Everything in Starter",
      "Priority processing",
      "Deeper per-student insights",
      "Email support",
    ],
    cta: "Choose Pro",
    plan: "pro",
    featured: true,
  },
  {
    name: "Unlimited",
    desc: "For full-time tutors teaching every day.",
    monthly: 49,
    lessons: "Unlimited lessons*",
    features: [
      "Everything in Pro",
      "Fastest processing",
      "Priority support",
      "Fair use ~250 lessons / mo",
    ],
    cta: "Choose Unlimited",
    plan: "unlimited",
    featured: false,
  },
];

export default function Pricing() {
  // Each paid card toggles its own billing period independently.
  const [annual, setAnnual] = useState<Record<string, boolean>>({});

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto w-full max-w-[1240px] px-8">
        <Reveal className="mx-auto mb-8 max-w-2xl text-center">
          <div className="text-[.82rem] font-bold uppercase tracking-widest text-brand">
            Pricing
          </div>
          <h2 className="mt-4 font-display text-[clamp(2rem,3.8vw,2.9rem)] font-medium tracking-tight">
            Plans that scale with your teaching week.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Start free with 4 lessons a month. No card required. Cancel anytime.
          </p>
        </Reveal>

        <Reveal className="mx-auto mb-12 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft/50 px-4 py-1.5 text-[.86rem] font-semibold text-brand-deep shadow-soft-sm">
            <span aria-hidden>🎉</span>
            Pay yearly and get 2 months free on any plan
          </div>
        </Reveal>

        <div className="mx-auto grid max-w-md grid-cols-1 items-stretch gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => {
            const isAnnual = !!annual[p.plan];
            // Annual billing = pay for 10 months, get 12 (2 months free).
            const annualTotal = p.monthly != null ? p.monthly * 10 : null;
            const href = `/signup?plan=${p.plan}${p.monthly != null && isAnnual ? "&billing=annual" : ""}`;

            return (
              <Reveal key={p.name} delay={i * 80} className="h-full">
                <div
                  className={`relative flex h-full flex-col rounded-[22px] bg-surface p-7 ${
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
                  <div className="mb-4 mt-1.5 min-h-[3.3rem] text-[.92rem] text-ink-soft">
                    {p.desc}
                  </div>

                  {/* per-card billing toggle — reserves the same height on Free so prices align */}
                  <div className="mb-3 min-h-[2.1rem]">
                    {p.monthly != null && (
                      <div className="inline-flex items-center gap-0.5 rounded-full border border-line bg-brand-soft/30 p-0.5 text-[.76rem] font-semibold">
                        <button
                          type="button"
                          onClick={() => setAnnual((s) => ({ ...s, [p.plan]: false }))}
                          className={`rounded-full px-3 py-1 transition-all duration-300 ${
                            !isAnnual ? "bg-brand-deep text-white shadow-soft-sm" : "text-ink-soft hover:text-ink"
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnnual((s) => ({ ...s, [p.plan]: true }))}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition-all duration-300 ${
                            isAnnual ? "bg-brand-deep text-white shadow-soft-sm" : "text-ink-soft hover:text-ink"
                          }`}
                        >
                          Annual
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[.62rem] font-bold uppercase tracking-wide ${
                              isAnnual ? "bg-white/20 text-white" : "bg-brand-soft text-brand-deep"
                            }`}
                          >
                            2 mo free
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {p.monthly == null ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-[2.6rem] font-semibold tracking-tight">
                        Free
                      </span>
                    </div>
                  ) : isAnnual ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-[2.6rem] font-semibold tracking-tight">
                        ${annualTotal}
                      </span>
                      <span className="font-medium text-muted">/ year</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-[2.6rem] font-semibold tracking-tight">
                        ${p.monthly}
                      </span>
                      <span className="font-medium text-muted">/ month</span>
                    </div>
                  )}

                  {/* billing sub-line — reserves height so cards stay aligned */}
                  <div className="mt-1 min-h-[1.25rem] text-[.82rem] font-medium text-brand-deep">
                    {p.monthly != null && isAnnual && `$${p.monthly}/mo billed annually · 2 months free`}
                  </div>

                  <div className="mb-6 mt-3 inline-flex w-fit rounded-full bg-brand-soft px-3 py-1 text-[.82rem] font-semibold text-brand-deep">
                    {p.lessons}
                  </div>
                  <ul className="mb-7 flex flex-col gap-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[.94rem] text-ink-soft">
                        <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-[7px] bg-brand-soft text-[.68rem] text-brand-deep">
                          ✓
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={href}
                    className={`group mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
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
            );
          })}
        </div>

        <Reveal className="mx-auto mt-6 max-w-2xl text-center">
          <p className="text-[.86rem] text-muted">
            *Unlimited is fair-use, capped around 250 lessons / month to keep pricing
            sustainable for everyone.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
