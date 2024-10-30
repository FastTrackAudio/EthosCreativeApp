import { NextResponse } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/app/utils/db"

export async function POST(
  req: Request,
  {
    params,
  }: { params: { courseId: string; sectionId: string; conceptId: string } }
) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { content } = await req.json()

  try {
    const updatedConcept = await prisma.concept.update({
      where: {
        id: params.conceptId,
        section: {
          id: params.sectionId,
          course: {
            id: params.courseId,
            userId: user.id,
          },
        },
      },
      data: {
        content,
      },
    })

    return NextResponse.json(updatedConcept)
  } catch (error) {
    console.error("Failed to update concept:", error)
    return NextResponse.json(
      { error: "Failed to update concept" },
      { status: 500 }
    )
  }
}
