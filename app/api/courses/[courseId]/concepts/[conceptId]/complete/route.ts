import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; conceptId: string } }
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get the last curriculum entry to determine the order
    const lastEntry = await prisma.userCurriculum.findFirst({
      where: {
        userId: user.id,
        courseId: params.courseId,
      },
      orderBy: {
        order: "desc",
      },
    })

    const nextOrder = (lastEntry?.order ?? -1) + 1

    // Create curriculum entry
    const entry = await prisma.userCurriculum.create({
      data: {
        userId: user.id,
        courseId: params.courseId,
        conceptId: params.conceptId,
        weekId: "1", // Default to week 1
        order: nextOrder,
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error("[CONCEPT_COMPLETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
