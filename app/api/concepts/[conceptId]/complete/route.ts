import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { conceptId: string } }
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const completion = await prisma.conceptCompletion.upsert({
      where: {
        userId_conceptId: {
          userId: user.id,
          conceptId: params.conceptId,
        },
      },
      update: {
        completed: true,
      },
      create: {
        userId: user.id,
        conceptId: params.conceptId,
        completed: true,
      },
    })

    return NextResponse.json(completion)
  } catch (error) {
    console.error("[CONCEPT_COMPLETION_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
