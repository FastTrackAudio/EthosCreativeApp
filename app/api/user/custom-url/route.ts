import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const customUrlSchema = z.object({
  customUrl: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/),
  type: z.enum(["artist", "dashboard"]),
})

export async function PATCH(req: Request) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { customUrl, type } = customUrlSchema.parse(body)

    // Check if URL is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ customUrl }, { artistPageUrl: customUrl }],
        NOT: {
          id: user.id,
        },
      },
    })

    if (existingUser) {
      return new NextResponse("URL already taken", { status: 409 })
    }

    // Update user's URL based on type
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data:
        type === "artist"
          ? { artistPageUrl: customUrl }
          : { customUrl: customUrl },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[CUSTOM_URL_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
