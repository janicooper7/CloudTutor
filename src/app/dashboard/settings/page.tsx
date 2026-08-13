import Topbar from "@/components/dashboard/Topbar";
import { currentTutorId } from "@/auth";
import { lessonUsage, studentUsage } from "@/lib/quota";

export default async function SettingsPage() {
  const tutorId = await currentTutorId();
  const [lessons, students] = await Promise.all([
    lessonUsage(tutorId),
    studentUsage(tutorId),
  ]);

  const pct = Math.min(100, Math.round((lessons.used / lessons.limit) * 100));

  return (
    <>
      <Topbar title="Settings" subtitle="Account, billing, and preferences" />
      <div className="px-6 py-8 lg:px-10">
        <div className="grid max-w-3xl gap-4">
          {/* Plan & usage — the real numbers. Everything else on this page is
              still a placeholder, and is labelled as such rather than pretending
              to be wired up. */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-semibold text-ink">Plan &amp; usage</div>
              <span className="rounded-full bg-brand-soft px-3 py-1 text-[.82rem] font-semibold text-brand-deep">
                {lessons.plan.name}
              </span>
            </div>

            <div className="mt-5 text-sm text-ink-soft">
              <span className="font-semibold text-ink">
                {lessons.used} of {lessons.limit}
              </span>{" "}
              lessons used this month
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-soft">
              <div
                className="h-full rounded-full bg-brand-deep transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-[.82rem] text-muted">
              Resets on the 1st of each month.
            </p>

            <div className="mt-5 border-t border-line pt-4 text-sm text-ink-soft">
              <span className="font-semibold text-ink">{students.used}</span>{" "}
              {students.used === 1 ? "student profile" : "student profiles"}
              {students.limit !== null && <> of {students.limit} included</>}
            </div>
          </div>

          {[
            { t: "Profile", d: "Your name, email, and photo." },
            { t: "Billing", d: "Payments aren't set up yet — plans are managed manually." },
            { t: "Consent & recording", d: "How students are notified that lessons are analyzed." },
          ].map((s) => (
            <div
              key={s.t}
              className="flex items-center justify-between rounded-2xl border border-line bg-surface p-6 opacity-70 shadow-soft-sm"
            >
              <div>
                <div className="font-semibold text-ink">{s.t}</div>
                <div className="text-sm text-ink-soft">{s.d}</div>
              </div>
              <span className="rounded-lg border border-line bg-white/60 px-4 py-2 text-sm font-semibold text-muted">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
