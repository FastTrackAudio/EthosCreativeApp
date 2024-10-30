import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string; conceptId: string } }
) {
  try {
    const data = await request.json()

    // Verify the concept exists and belongs to the course
    const concept = await prisma.concept.findFirst({
      where: {
        id: params.conceptId,
        section: {
          courseId: params.courseId,
        },
      },
    })

    if (!concept) {
      return new NextResponse("Concept not found", { status: 404 })
    }

    // If changing sections, verify the new section belongs to the course
    if (data.sectionId) {
      const section = await prisma.section.findUnique({
        where: {
          id: data.sectionId,
          courseId: params.courseId,
        },
      })

      if (!section) {
        return new NextResponse("Invalid section ID", { status: 400 })
      }
    }

    // Update the concept
    const updatedConcept = await prisma.concept.update({
      where: {
        id: params.conceptId,
      },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        sectionId: data.sectionId,
        order: data.order,
      },
    })

    return NextResponse.json(updatedConcept)
  } catch (error) {
    console.error("Error updating concept:", error)
    return new NextResponse("Error updating concept", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; conceptId: string } }
) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const deletedConcept = await prisma.concept.delete({
      where: {
        id: params.conceptId,
        section: {
          course: {
            id: params.courseId,
            userId: user.id,
          },
        },
      },
    })

    return NextResponse.json(deletedConcept)
  } catch (error) {
    console.error("Failed to delete concept:", error)
    return NextResponse.json(
      { error: "Failed to delete concept" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; conceptId: string } }
) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const concept = await prisma.concept.findUnique({
      where: {
        id: params.conceptId,
        section: {
          course: {
            id: params.courseId,
            userId: user.id,
          },
        },
      },
    })

    if (!concept) {
      return NextResponse.json({ error: "Concept not found" }, { status: 404 })
    }

    return NextResponse.json(concept)
  } catch (error) {
    console.error("Failed to fetch concept:", error)
    return NextResponse.json(
      { error: "Failed to fetch concept" },
      { status: 500 }
    )
  }
}
