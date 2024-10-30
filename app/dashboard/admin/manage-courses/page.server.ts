import prisma from "@/app/utils/db"

export async function getAdminCourses() {
  // Fetch all courses for admin view
  const courses = await prisma.course.findMany({
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  return courses
}
