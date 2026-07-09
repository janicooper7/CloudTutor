"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "../Reveal";

const STEP_MS = 7200;

const steps = [
  {
    n: 1,
    tag: "extension",
    title: "Hit record, then forget it",
    body: "Pick the student in the extension and start. No bot joins your call — then teach exactly how you always do.",
  },
  {
    n: 2,
    tag: "listening",
    title: "It listens & separates",
    body: "CloudTutor captures the conversation and cleanly tells your voice apart from your student's — no diarization guesswork.",
  },
  {
    n: 3,
    tag: "drafting",
    title: "The draft writes itself",
    body: "Vocabulary in context, mistakes caught, next-lesson plan — written against everything the student has done so far. You type nothing.",
  },
  {
    n: 4,
    tag: "review",
    title: "Review & send",
    body: "Tweak anything, confirm, and email a clean PDF. The audio is discarded — only your notes are kept.",
  },
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // reduced-motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  // only animate while the demo is on screen
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // auto-advance loop
  useEffect(() => {
    if (!inView || reduced) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % steps.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, inView, reduced]);

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

        <Reveal className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12">
          {/* ---- progress steps ---- */}
          <ol className="flex flex-col gap-2.5">
            {steps.map((s, i) => {
              const isActive = i === active;
              return (
                <li key={s.n}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={isActive ? "step" : undefined}
                    className={`group flex w-full gap-4 rounded-[18px] border p-4 text-left transition-all duration-300 sm:p-5 ${
                      isActive
                        ? "border-brand-line bg-surface shadow-soft-sm"
                        : "border-transparent hover:border-line hover:bg-surface/60"
                    }`}
                  >
                    <span
                      className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[12px] font-display text-lg font-semibold transition-colors duration-300 ${
                        isActive
                          ? "bg-brand text-white"
                          : "bg-brand-soft text-brand-deep"
                      }`}
                    >
                      {s.n}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-medium text-ink">
                        {s.title}
                      </span>
                      <span
                        className={`grid overflow-hidden transition-all duration-500 ${
                          isActive
                            ? "mt-1 grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <span className="min-h-0 text-[.94rem] text-ink-soft">
                          {s.body}
                        </span>
                      </span>
                      {/* auto-advance progress bar */}
                      <span className="mt-3 block h-[3px] overflow-hidden rounded-full bg-line">
                        <span
                          key={active}
                          className="block h-full rounded-full bg-brand"
                          style={
                            isActive
                              ? !reduced && inView
                                ? { animation: `ct-progress ${STEP_MS}ms linear forwards` }
                                : { width: "100%" }
                              : { width: 0 }
                          }
                        />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* ---- animated app window ---- */}
          <div
            ref={stageRef}
            className="overflow-hidden rounded-[24px] border border-line bg-surface shadow-soft-lg"
          >
            {/* window chrome */}
            <div className="flex items-center gap-2 border-b border-line bg-bg-tint/60 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#f2b9b0]" />
              <span className="h-3 w-3 rounded-full bg-[#f4d7a3]" />
              <span className="h-3 w-3 rounded-full bg-[#b7e3c4]" />
              <span className="ml-3 rounded-md bg-surface px-2.5 py-1 text-[.7rem] font-semibold tracking-wide text-muted">
                cloudtutor · {steps[active].tag}
              </span>
            </div>

            {/* scene */}
            <div className="relative min-h-[380px] p-6 sm:min-h-[420px] sm:p-8">
              <Scene key={active} step={active} playing={inView && !reduced} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- scenes ---------------- */

function Scene({ step, playing }: { step: number; playing: boolean }) {
  if (step === 0) return <SceneRecord playing={playing} />;
  if (step === 1) return <SceneListen playing={playing} />;
  if (step === 2) return <SceneDraft playing={playing} />;
  return <SceneSend />;
}

function rise(delay: number): React.CSSProperties {
  return { animationDelay: `${delay}ms` };
}

/* Step 1 — extension popup, recording */
function SceneRecord({ playing }: { playing: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="ct-rise w-full max-w-[320px] rounded-[20px] border border-line bg-white p-5 shadow-soft-md">
        <div className="mb-4 flex items-center gap-2 text-[.72rem] font-bold uppercase tracking-widest text-muted">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-brand text-white">☁</span>
          CloudTutor
        </div>

        <div className="mb-1 text-[.72rem] font-semibold uppercase tracking-wide text-muted">
          Student
        </div>
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-brand-line bg-brand-soft px-3 py-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-semibold text-white">
            M
          </span>
          <span className="font-medium text-ink">Maria García</span>
          <span className="ml-auto text-brand-deep">▾</span>
        </div>

        <div className="ct-rise flex items-center justify-center gap-3 rounded-xl bg-ink px-4 py-3 text-white" style={rise(220)}>
          <span className={`h-3 w-3 rounded-full bg-[#ff6b6b] ${playing ? "animate-pulse-dot" : ""}`} />
          <span className="font-medium">Recording</span>
          <span className="font-display tabular-nums text-white/80">00:14</span>
        </div>

        <p className="ct-rise mt-3 text-center text-[.78rem] text-muted" style={rise(360)}>
          No bot in your call · teach as usual
        </p>
      </div>
    </div>
  );
}

/* Step 2 — voice separation + live transcript */
function SceneListen({ playing }: { playing: boolean }) {
  const bars = [45, 70, 40, 82, 55, 90, 60, 78, 50, 84, 44, 66, 58, 88, 48, 72];
  const lines = [
    { who: "You", text: "So, how did the negotiation go?", me: true },
    { who: "Maria", text: "We postpone the deadline until Friday.", me: false },
    { who: "You", text: "Nice — we'd say \"postponed\".", me: true },
  ];
  return (
    <div className="flex h-full flex-col gap-5">
      <div className="ct-rise grid grid-cols-2 gap-3">
        {[
          { label: "You", color: "var(--color-brand)" },
          { label: "Maria", color: "var(--color-mint)" },
        ].map((track, ti) => (
          <div key={track.label} className="rounded-xl border border-line bg-white p-3">
            <div className="mb-2 flex items-center gap-2 text-[.74rem] font-semibold text-ink-soft">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: track.color }} />
              {track.label}
            </div>
            <div className="flex h-9 items-end gap-[3px]">
              {bars.map((h, i) => (
                <span
                  key={i}
                  className={`w-full rounded-sm ${playing ? "ct-eq" : ""}`}
                  style={{
                    height: `${h}%`,
                    background: track.color,
                    opacity: 0.35 + (i % 5) * 0.13,
                    animationDelay: `${(i * 70 + ti * 120) % 900}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {lines.map((l, i) => (
          <div
            key={i}
            className="ct-rise flex gap-2.5"
            style={rise(200 + i * 260)}
          >
            <span
              className="mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[.7rem] font-bold"
              style={{
                color: l.me ? "var(--color-brand-deep)" : "#137e70",
                background: l.me ? "var(--color-brand-soft)" : "rgba(43,182,164,.14)",
              }}
            >
              {l.who}
            </span>
            <span className="text-[.95rem] text-ink">{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Step 3 — draft writing itself */
function SceneDraft({ playing }: { playing: boolean }) {
  const words = ["to negotiate", "deadline", "to postpone", "on second thought"];
  return (
    <div className="flex h-full flex-col">
      <div className="ct-rise mb-4 flex items-center gap-2 text-[.74rem] font-semibold uppercase tracking-wide text-brand-deep">
        <span className="h-2 w-2 animate-pulse-dot rounded-full bg-brand" />
        Drafting from this lesson + 11 before it
      </div>

      <div className="ct-rise mb-1 text-[.72rem] font-semibold uppercase tracking-wide text-muted" style={rise(120)}>
        New words in context
      </div>
      <div className="ct-rise mb-5 flex flex-wrap gap-2" style={rise(160)}>
        {words.map((w) => (
          <span
            key={w}
            className="rounded-full border border-brand-line bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand-deep"
          >
            {w}
          </span>
        ))}
      </div>

      <div className="ct-rise mb-1 text-[.72rem] font-semibold uppercase tracking-wide text-muted" style={rise(320)}>
        Areas to improve
      </div>
      <ul className="mb-5 flex flex-col gap-2 text-[.95rem] text-ink">
        {[
          "Articles before abstract nouns (“advice”)",
          "Past tense: “postpone” → “postponed”",
        ].map((t, i) => (
          <li key={i} className="ct-rise flex gap-2.5" style={rise(360 + i * 220)}>
            <span className="text-brand-deep">→</span>
            {t}
          </li>
        ))}
      </ul>

      <div
        className="ct-rise mt-auto flex items-center gap-2 rounded-lg bg-brand-soft px-3 py-2 text-[.92rem] font-medium text-brand-deep"
        style={rise(820)}
      >
        → Next lesson: role-play negotiating a deadline
        <span className={`ml-1 inline-block h-4 w-[2px] bg-brand-deep ${playing ? "ct-caret" : ""}`} />
      </div>
    </div>
  );
}

/* Step 4 — review & send */
function SceneSend() {
  return (
    <div className="flex h-full flex-col">
      <div className="ct-rise flex-1 rounded-xl border border-line bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-lg font-medium text-ink">Maria&apos;s recap</span>
          <span className="rounded-md border border-brand-line bg-brand-soft px-2 py-1 text-[.68rem] font-bold text-brand-deep">
            PDF
          </span>
        </div>
        <div className="space-y-2.5">
          <div className="h-2.5 w-11/12 rounded-full bg-line" />
          <div className="h-2.5 w-4/5 rounded-full bg-line" />
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2/5 rounded-full bg-brand-soft" />
            <span className="inline-block h-4 w-[2px] bg-brand ct-caret" />
          </div>
          <div className="h-2.5 w-3/4 rounded-full bg-line" />
        </div>
      </div>

      <div className="ct-rise mt-4 flex items-center gap-3" style={rise(240)}>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-medium text-white shadow-soft-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
          Send PDF
        </button>
        <span className="text-[.86rem] text-ink-soft">
          → maria@email.com · audio discarded
        </span>
      </div>
    </div>
  );
}
