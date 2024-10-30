import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

export async function GET() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const enrolledCourses = await prisma.courseEnrollment.findMany({
      where: {
        userId: user.id,
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

    const transformedCourses = enrolledCourses.map((enrollment) => ({
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

    return NextResponse.json(transformedCourses)
  } catch (error) {
    console.error("[ENROLLED_COURSES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
