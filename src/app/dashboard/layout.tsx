import { auth, currentTutorId } from "@/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import { getStudents } from "@/db/queries";
import { lessonUsage } from "@/lib/quota";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, tutorId] = await Promise.all([auth(), currentTutorId()]);
  const [allStudents, usage] = await Promise.all([getStudents(), lessonUsage(tutorId)]);

  const students = allStudents
    .filter((s) => s.active !== false)
    .map((s) => ({ id: s.id, name: s.name, initial: s.initial }));

  // Only the display-facing slice crosses into the client component.
  const quota = {
    used: usage.used,
    limit: usage.limit,
    remaining: usage.remaining,
    allowed: usage.allowed,
    planName: usage.plan.name,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar user={session?.user ?? null} students={students} quota={quota} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
