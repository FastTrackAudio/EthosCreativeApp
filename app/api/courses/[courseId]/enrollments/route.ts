import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: params.courseId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            artistPageUrl: true,
          },
        },
      },
    })
    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("[ENROLLMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await request.json()
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: params.courseId,
      },
      include: {
        user: true,
      },
    })
    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("[ENROLLMENTS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await request.json()
    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        },
      },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[ENROLLMENTS_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
