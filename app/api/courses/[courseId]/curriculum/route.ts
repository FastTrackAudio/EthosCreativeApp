import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const curriculum = await prisma.userCurriculum.findMany({
      where: {
        userId: user.id,
        courseId: params.courseId,
      },
      include: {
        concept: {
          include: {
            section: true,
            completions: {
              where: {
                userId: user.id
              }
            }
          }
        }
      },
      orderBy: [
        { weekId: "asc" },
        { order: "asc" }
      ],
    })

    const transformedCurriculum = curriculum.map(entry => ({
      conceptId: entry.conceptId,
      order: entry.order,
      weekId: entry.weekId,
      isCompleted: entry.concept.completions.length > 0,
      concept: {
        id: entry.concept.id,
        title: entry.concept.title,
        description: entry.concept.description,
        shortTitle: entry.concept.shortTitle,
        shortDescription: entry.concept.shortDescription,
        imageUrl: entry.concept.imageUrl,
        sectionId: entry.concept.sectionId,
        sectionTitle: entry.concept.section.title,
      }
    }))

    return NextResponse.json(transformedCurriculum)
  } catch (error) {
    console.error("[CURRICULUM_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
