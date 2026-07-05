// Seed-only tutor identity.
//
// Real auth lives in src/auth.ts (NextAuth + Google). This constant is used by
// the seed script to own the sample students/sessions under a stable tutor row.
// The runtime tenant is resolved from the session via currentTutorId() in
// src/auth.ts — not from here.

export const DEV_TUTOR = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "dev@cloudtutor.local",
  name: "Alex",
} as const;
