// Plan definitions — the single source of truth for what each tier allows.
//
// These numbers are the ones advertised on the pricing page
// (src/components/sections/Pricing.tsx); if you change one, change both. Billing
// isn't wired up yet, so nothing here charges anyone — the limits exist so that
// public signup can't turn into unbounded Deepgram + Anthropic spend on lessons
// nobody is paying for. Stripe will later set `tutors.plan`; today every new
// tutor lands on `free`.

export const PLAN_IDS = ["free", "starter", "pro", "unlimited"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export type Plan = {
  id: PlanId;
  name: string;
  /** Lessons that may be processed per calendar month. */
  lessonsPerMonth: number;
  /** Student profiles allowed, or null for no limit. */
  students: number | null;
};

export const PLANS: Record<PlanId, Plan> = {
  free: { id: "free", name: "Free", lessonsPerMonth: 4, students: 3 },
  starter: { id: "starter", name: "Starter", lessonsPerMonth: 40, students: null },
  pro: { id: "pro", name: "Pro", lessonsPerMonth: 120, students: null },
  // "Unlimited" is fair-use, capped at the ~250/mo the pricing footnote states.
  unlimited: { id: "unlimited", name: "Unlimited", lessonsPerMonth: 250, students: null },
};

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && (PLAN_IDS as readonly string[]).includes(value);
}

export function planFor(id: string | null | undefined): Plan {
  return isPlanId(id) ? PLANS[id] : PLANS.free;
}
