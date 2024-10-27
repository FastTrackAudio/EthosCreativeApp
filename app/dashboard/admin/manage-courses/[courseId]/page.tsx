import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";
import { notFound } from "next/navigation";
import { KanbanBoard } from "./KanbanBoard";

async function getCourse(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      userId: userId,
    },
  });

  if (!course) {
    notFound();
  }

  return course;
}

export default async function CourseCreatePage({
  params,
}: {
  params: { courseId: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return <div>Unauthorized</div>;
  }

  const course = await getCourse(params.courseId, user.id);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
      <p className="mb-4">{course.description}</p>
      <KanbanBoard courseId={course.id} />
    </div>
  );
}
