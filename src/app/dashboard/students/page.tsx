import Topbar from "@/components/dashboard/Topbar";
import StudentsView from "@/components/dashboard/StudentsView";
import { getStudents } from "@/db/queries";

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <>
      <Topbar title="Students" subtitle="Everyone you're currently teaching" />
      <StudentsView list={students} />
    </>
  );
}
