import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

// GET - Fetch curriculum
export async function GET(
  req: Request,
  { params }: { params: { courseId: string; userId: string } }
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const curriculum = await prisma.userCurriculum.findMany({
      where: {
        userId: params.userId,
        courseId: params.courseId,
      },
      include: {
        concept: {
          select: {
            id: true,
            title: true,
            description: true,
            sectionId: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(curriculum)
  } catch (error) {
    console.error("[CURRICULUM_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// POST - Add concept to curriculum
export async function POST(
  req: Request,
  { params }: { params: { courseId: string; userId: string } }
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { conceptId, weekId, order } = await req.json()

    const curriculumItem = await prisma.userCurriculum.create({
      data: {
        userId: params.userId,
        courseId: params.courseId,
        conceptId: conceptId,
        weekId: weekId,
        order: order,
      },
      include: {
        concept: true,
      },
    })

    return NextResponse.json(curriculumItem)
  } catch (error) {
    console.error("[CURRICULUM_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
