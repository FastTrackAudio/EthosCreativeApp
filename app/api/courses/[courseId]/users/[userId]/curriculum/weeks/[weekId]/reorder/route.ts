import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; userId: string; weekId: string } }
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { concepts } = await req.json()

    // Update each concept's order in the curriculum
    await Promise.all(
      concepts.map(
        ({ conceptId, order }: { conceptId: string; order: number }) =>
          prisma.userCurriculum.update({
            where: {
              userId_courseId_conceptId: {
                userId: params.userId,
                courseId: params.courseId,
                conceptId,
              },
            },
            data: {
              order,
              weekId: params.weekId,
            },
          })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[REORDER_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
