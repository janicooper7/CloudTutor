import Link from "next/link";
import Topbar from "@/components/dashboard/Topbar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Avatar from "@/components/dashboard/Avatar";
import { ArrowUpIcon, ChevronRightIcon } from "@/components/dashboard/icons";
import { auth } from "@/auth";
import { getPendingSessions, getSessions, getStudents } from "@/db/queries";

// Monday 00:00 of the week containing `d`.
function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const mondayOffset = (x.getDay() + 6) % 7; // Sun=0 -> 6, Mon=1 -> 0, …
  x.setDate(x.getDate() - mondayOffset);
  return x;
}

type StatTone = "up" | "down" | "muted";

export default async function DashboardHome() {
  const [session, pending, students, sessions] = await Promise.all([
    auth(),
    getPendingSessions(),
    getStudents(),
    getSessions(),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const activeCount = students.filter((s) => s.active !== false).length;
  // Only drafts still "need review" — a confirmed lesson has been reviewed and
  // is just awaiting send, so it stays in the list but isn't counted as a draft.
  const draftCount = pending.filter((s) => s.status === "draft").length;

  // Real lessons-per-week from session dates, plus a week-over-week trend.
  const thisWeekStart = startOfWeek(new Date());
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const dateOf = (iso: string) => new Date(`${iso}T00:00:00`);
  const thisWeek = sessions.filter((s) => dateOf(s.isoDate) >= thisWeekStart).length;
  const lastWeek = sessions.filter(
    (s) => dateOf(s.isoDate) >= lastWeekStart && dateOf(s.isoDate) < thisWeekStart,
  ).length;
  const weekDiff = thisWeek - lastWeek;
  const weekDelta =
    weekDiff > 0 ? `+${weekDiff} vs last week`
    : weekDiff < 0 ? `${weekDiff} vs last week`
    : "same as last week";
  const weekTone: StatTone = weekDiff > 0 ? "up" : weekDiff < 0 ? "down" : "muted";

  const stats: { label: string; value: string; delta: string; tone: StatTone }[] = [
    { label: "Active students", value: String(activeCount), delta: "on your roster", tone: "muted" },
    { label: "Lessons this week", value: String(thisWeek), delta: weekDelta, tone: weekTone },
    { label: "Drafts to review", value: String(draftCount), delta: "Awaiting you", tone: "muted" },
  ];

  return (
    <>
      <Topbar title={`Good afternoon, ${firstName}`} subtitle="Here's what's happened since your last lessons." />

      <div className="px-6 py-8 lg:px-10">
        {/* stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-line bg-surface p-5 shadow-soft-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-md"
            >
              <div className="text-sm text-ink-soft">{s.label}</div>
              <div className="mt-1.5 font-display text-[2rem] font-semibold leading-none tracking-tight text-ink">
                {s.value}
              </div>
              <div
                className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
                  s.tone === "up" ? "text-mint" : s.tone === "down" ? "text-ink-soft" : "text-muted"
                }`}
              >
                {s.tone === "up" && <ArrowUpIcon size={13} />}
                {s.tone === "down" && <ArrowUpIcon size={13} className="rotate-180" />}
                {s.delta}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* review queue */}
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-soft-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-medium text-ink">Awaiting your review</h2>
              <span className="rounded-full bg-amber/15 px-2.5 py-1 text-xs font-semibold text-[#b5791f]">
                {draftCount} {draftCount === 1 ? "draft" : "drafts"}
              </span>
            </div>

            {pending.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-white/40 px-6 py-12 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-mint/15 text-lg text-[#137e70]">✓</span>
                <div className="font-semibold text-ink">All caught up</div>
                <div className="text-sm text-muted">
                  Every lesson has been reviewed and sent. New drafts will appear here.
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pending.map((s) => (
                  <Link
                    key={s.id}
                    href={`/dashboard/sessions/${s.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-line bg-white/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-line hover:shadow-soft-sm"
                  >
                    <Avatar initial={s.studentInitial} size={46} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-ink">{s.studentName}</div>
                      <div className="truncate text-sm text-ink-soft">{s.title}</div>
                      <div className="mt-1 text-xs text-muted">{s.date} · {s.durationMin} min</div>
                    </div>
                    <StatusBadge status={s.status} />
                    <ChevronRightIcon className="text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-deep" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* students snapshot */}
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-soft-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-medium text-ink">Your students</h2>
              <Link href="/dashboard/students" className="text-sm font-semibold text-brand-deep hover:underline">
                View all
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {students.map((st) => (
                <Link
                  key={st.id}
                  href={`/dashboard/students/${st.id}`}
                  className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-brand-soft/50"
                >
                  <Avatar initial={st.initial} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink">{st.name}</div>
                    <div className="truncate text-xs text-muted">{st.goal}</div>
                  </div>
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-deep">
                    {st.level}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
