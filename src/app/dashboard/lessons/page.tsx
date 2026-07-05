import Link from "next/link";
import Topbar from "@/components/dashboard/Topbar";
import Avatar from "@/components/dashboard/Avatar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { ChevronRightIcon } from "@/components/dashboard/icons";
import { sortSessions, splitLessonTitle } from "@/lib/mock";
import { getSessions } from "@/db/queries";

export default async function LessonsPage() {
  const sessions = sortSessions(await getSessions(), "date");

  return (
    <>
      <Topbar title="Lessons" subtitle="Every recorded session and its feedback status" />

      <div className="px-6 py-8 lg:px-10">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft-sm">
          {sessions.map((s, i) => {
            const { label, topic } = splitLessonTitle(s.title);
            const meta = [label, `${s.durationMin} min`].filter(Boolean).join(" · ");
            return (
              <Link
                key={s.id}
                href={`/dashboard/sessions/${s.id}`}
                className={`group flex items-center gap-4 p-5 transition-colors hover:bg-brand-soft/40 ${
                  i < sessions.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <Avatar initial={s.studentInitial} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink">
                    {s.studentName} · {s.date} · {topic}
                  </div>
                  <div className="text-sm text-muted">{meta}</div>
                </div>
                <StatusBadge status={s.status} />
                <ChevronRightIcon className="text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-deep" />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
