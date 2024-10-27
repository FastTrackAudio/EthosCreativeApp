import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";

export async function getUserCourses() {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  if (!kindeUser || !kindeUser.id) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { id: kindeUser.id },
    include: { courses: true },
  });

  return (
    user?.courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    })) || []
  );
}
