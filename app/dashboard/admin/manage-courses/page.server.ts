import prisma from "@/app/utils/db";

export async function getAdminCourses() {
  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          sections: true,
        },
      },
    },
  });

  return courses;
}
