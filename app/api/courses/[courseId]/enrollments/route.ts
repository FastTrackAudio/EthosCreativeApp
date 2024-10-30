import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    const { userId } = await request.json()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId,
        courseId: params.courseId,
      },
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("[COURSES_ENROLLMENT_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    const { userId } = await request.json()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.courseEnrollment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        },
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[COURSES_ENROLLMENT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
