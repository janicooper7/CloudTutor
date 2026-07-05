import { notFound } from "next/navigation";
import Topbar from "@/components/dashboard/Topbar";
import StudentDetailView from "@/components/dashboard/StudentDetailView";
import { getSessionsForStudent, getStudentById } from "@/db/queries";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();

  const history = await getSessionsForStudent(id);

  return (
    <>
      <Topbar title={student.name} subtitle={`${student.native} · ${student.goal}`} />
      <StudentDetailView student={student} initialHistory={history} />
    </>
  );
}
