import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await req.json()

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        bio: data.bio,
        artistType: data.artistType,
        workType: data.workType,
        skills: data.skills,
        socialLinks: data.socialLinks,
        achievements: data.achievements,
        featuredWorks: data.featuredWorks,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[PROFILE_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
