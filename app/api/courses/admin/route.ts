import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("[COURSES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
