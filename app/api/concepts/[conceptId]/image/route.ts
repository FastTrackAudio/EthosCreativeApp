import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

export async function PATCH(
  req: Request,
  { params }: { params: { conceptId: string } }
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { imageUrl } = await req.json()

    const concept = await prisma.concept.update({
      where: { id: params.conceptId },
      data: { imageUrl },
    })

    return NextResponse.json(concept)
  } catch (error) {
    console.error("[CONCEPT_IMAGE_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
