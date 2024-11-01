import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

// POST - Create new week
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

    const { weekId } = await req.json()

    // No need to create a week record - weeks are just identifiers in UserCurriculum
    return NextResponse.json({ weekId })
  } catch (error) {
    console.error("[WEEK_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
