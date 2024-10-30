import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/app/utils/db"

export async function getUserCourses() {
  const { getUser } = getKindeServerSession()
  const kindeUser = await getUser()

  if (!kindeUser || !kindeUser.id) {
    return []
  }

  // Get courses where the user is enrolled
  const enrolledCourses = await prisma.courseEnrollment.findMany({
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
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      },
    },
    orderBy: {
      enrolledAt: "desc",
    },
  })

  // Transform the data to match the expected format
  return enrolledCourses.map((enrollment) => ({
    id: enrollment.course.id,
    title: enrollment.course.title,
    description: enrollment.course.description,
    enrolledAt: enrollment.enrolledAt.toISOString(),
    createdAt: enrollment.course.createdAt.toISOString(),
    updatedAt: enrollment.course.updatedAt.toISOString(),
    sectionCount: enrollment.course.sections.length,
    conceptCount: enrollment.course.sections.reduce(
      (acc, section) => acc + section._count.concepts,
      0
    ),
    studentCount: enrollment.course._count.enrollments,
  }))
}
