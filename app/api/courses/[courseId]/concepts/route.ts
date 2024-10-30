import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const concepts = await prisma.concept.findMany({
      where: {
        section: {
          courseId: params.courseId,
        },
      },
      orderBy: { order: "asc" },
    })
    return NextResponse.json(concepts)
  } catch (error) {
    console.error("Error fetching concepts:", error)
    return new NextResponse("Error fetching concepts", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const data = await request.json()

    // Verify the section belongs to the course
    const section = await prisma.section.findUnique({
      where: {
        id: data.sectionId,
        courseId: params.courseId,
      },
    })

    if (!section) {
      return new NextResponse("Invalid section ID", { status: 400 })
    }

    // Get the highest order in the section
    const highestOrder = await prisma.concept.findFirst({
      where: { sectionId: data.sectionId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    // Create the concept
    const concept = await prisma.concept.create({
      data: {
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        sectionId: data.sectionId,
        order: (highestOrder?.order ?? -1) + 1,
        content: "{}",
      },
    })

    return NextResponse.json(concept)
  } catch (error) {
    console.error("Error creating concept:", error)
    return new NextResponse("Error creating concept", { status: 500 })
  }
}
