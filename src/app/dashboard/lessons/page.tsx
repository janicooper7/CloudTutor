import Topbar from "@/components/dashboard/Topbar";
import LessonSection from "@/components/dashboard/LessonSection";
import { sortSessions, type SessionStatus } from "@/lib/mock";
import { getSessions } from "@/db/queries";

// The three buckets a lesson moves through, in the order the tutor works them:
// drafts first (they need action), then confirmed-but-unsent, then done.
const SECTIONS: { status: SessionStatus; title: string; pill: string; hint: string }[] = [
  {
    status: "draft",
    title: "Needs review",
    pill: "bg-danger/12 text-danger-deep",
    hint: "Feedback is drafted and waiting for you to check it.",
  },
  {
    status: "confirmed",
    title: "Confirmed",
    pill: "bg-info/12 text-info-deep",
    hint: "Reviewed and ready — not sent to the student yet.",
  },
  {
    status: "sent",
    title: "Completed",
    pill: "bg-success/12 text-success-deep",
    hint: "Sent to the student.",
  },
];

export default async function LessonsPage() {
  const sessions = sortSessions(await getSessions(), "date");

  return (
    <>
      <Topbar title="Lessons" subtitle="Every recorded session and its feedback status" />

      <div className="px-6 py-8 lg:px-10">
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface px-4 py-14 text-center text-sm text-muted shadow-soft-sm">
            No lessons recorded yet.
          </div>
        ) : (
          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <LessonSection
                key={section.status}
                {...section}
                sessions={sessions.filter((s) => s.status === section.status)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
