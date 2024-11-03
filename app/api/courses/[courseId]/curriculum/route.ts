import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const curriculum = await prisma.userCurriculum.findMany({
      where: {
        userId: user.id,
        courseId: params.courseId,
      },
      orderBy: [{ weekId: "asc" }, { order: "asc" }],
      select: {
        conceptId: true,
        order: true,
        weekId: true,
        isCompleted: true,
      },
    })

    return NextResponse.json(curriculum)
  } catch (error) {
    console.error("[CURRICULUM_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
