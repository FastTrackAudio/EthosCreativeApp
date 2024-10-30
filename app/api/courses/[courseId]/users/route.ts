import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        artistPageUrl: true,
        enrolledCourses: {
          where: {
            courseId: params.courseId,
          },
          select: {
            enrolledAt: true,
          },
        },
      },
    })

    const transformedUsers = users.map((user) => ({
      ...user,
      enrolled: user.enrolledCourses.length > 0,
      enrolledAt: user.enrolledCourses[0]?.enrolledAt || null,
      enrolledCourses: undefined,
    }))

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error("[COURSES_USERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
