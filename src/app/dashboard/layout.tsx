import { auth } from "@/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import { getStudents } from "@/db/queries";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, allStudents] = await Promise.all([auth(), getStudents()]);
  const students = allStudents
    .filter((s) => s.active !== false)
    .map((s) => ({ id: s.id, name: s.name, initial: s.initial }));

  return (
    <div className="flex min-h-screen">
      <Sidebar user={session?.user ?? null} students={students} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
