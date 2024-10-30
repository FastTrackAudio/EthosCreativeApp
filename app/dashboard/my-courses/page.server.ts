import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";

export async function getUserCourses() {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  if (!kindeUser || !kindeUser.id) {
    return [];
  }

  // Get courses where the user is enrolled using the Enrollment model
  const enrolledCourses = await prisma.enrollment.findMany({
    where: {
      userId: kindeUser.id,
    },
    include: {
      course: {
        include: {
          sections: {
            include: {
              _count: {
                select: {
                  concepts: true,
                },
              },
            },
          },
          enrollments: true,
        },
      },
    },
    orderBy: {
      enrolledAt: "desc",
    },
  });

  // Transform the data to match the StudentCourseListWrapper interface
  return enrolledCourses.map((enrollment) => ({
    id: enrollment.course.id,
    title: enrollment.course.title,
    description: enrollment.course.description,
    enrolledAt: enrollment.enrolledAt.toISOString(),
    createdAt: enrollment.course.createdAt.toISOString(),
    updatedAt: enrollment.course.updatedAt.toISOString(),
    sectionCount: enrollment.course.sections.length,
    conceptCount: enrollment.course.sections.reduce(
      (acc: number, section: any) => acc + (section._count?.concepts || 0),
      0
    ),
    studentCount: enrollment.course.enrollments.length,
  }));
}
