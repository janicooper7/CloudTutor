// Centralized, validated environment access. Import from here rather than
// reaching for process.env directly so a missing/blank value fails loudly with
// a helpful message instead of a cryptic runtime error deep in a query.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and set it (see .env.example for where to find the value).`,
    );
  }
  return value;
}

export const env = {
  get DATABASE_URL() {
    return required("DATABASE_URL");
  },
  get ANTHROPIC_API_KEY() {
    return required("ANTHROPIC_API_KEY");
  },
  get RESEND_API_KEY() {
    return required("RESEND_API_KEY");
  },
  get DEEPGRAM_API_KEY() {
    return required("DEEPGRAM_API_KEY");
  },
  // Shared secret gating the internal background-processing function so only our
  // own /api/upload/complete route can trigger it (the function's URL is public).
  get INTERNAL_TASK_SECRET() {
    return required("INTERNAL_TASK_SECRET");
  },
  // The From address for lesson-report emails. Resend's shared sandbox address
  // works for testing (only delivers to your own account email); set a verified
  // domain sender for real students.
  get EMAIL_FROM() {
    return process.env.EMAIL_FROM || "CloudTutor <onboarding@resend.dev>";
  },
};
