import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

// DELETE - Remove concept from curriculum
export async function DELETE(
  req: Request,
  {
    params,
  }: { params: { courseId: string; userId: string; conceptId: string } }
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.userCurriculum.deleteMany({
      where: {
        userId: params.userId,
        courseId: params.courseId,
        conceptId: params.conceptId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CURRICULUM_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
