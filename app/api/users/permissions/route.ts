import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { getUser } = getKindeServerSession()
    const kindeUser = await getUser()

    if (!kindeUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: kindeUser.id,
      },
      select: {
        permissions: true,
      },
    })

    return NextResponse.json({ permissions: user?.permissions || "User" })
  } catch (error) {
    console.error("[USER_PERMISSIONS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
