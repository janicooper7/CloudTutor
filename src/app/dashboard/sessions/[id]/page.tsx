import { notFound } from "next/navigation";
import Topbar from "@/components/dashboard/Topbar";
import SessionReview from "@/components/dashboard/SessionReview";
import { getSessionById, getStudentById } from "@/db/queries";

export default async function SessionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionById(id);
  if (!session) notFound();
  const student = await getStudentById(session.studentId);

  return (
    <>
      <Topbar title="Review lesson feedback" subtitle="Edit, confirm, and send" />
      <SessionReview session={session} student={student} />
    </>
  );
}
