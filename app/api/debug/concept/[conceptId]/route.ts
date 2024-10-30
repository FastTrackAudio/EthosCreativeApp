import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

export async function GET(
  req: Request,
  { params }: { params: { conceptId: string } }
) {
  try {
    const concept = await prisma.concept.findUnique({
      where: {
        id: params.conceptId,
      },
      include: {
        section: {
          select: {
            title: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    })

    if (!concept) {
      return NextResponse.json({ error: "Concept not found" }, { status: 404 })
    }

    // Create a detailed report
    const report = {
      concept: {
        id: concept.id,
        title: concept.title,
        contentType: typeof concept.content,
        contentLength: JSON.stringify(concept.content).length,
        contentPreview: JSON.stringify(concept.content).slice(0, 100) + "...",
        hasBlocks: concept.blocks !== null,
        hasAttachments: concept.attachments !== null,
        hasResources: concept.resources !== null,
        hasMetadata: concept.metadata !== null,
        createdAt: concept.createdAt,
        updatedAt: concept.updatedAt,
      },
      section: {
        title: concept.section.title,
        course: concept.section.course.title,
      },
      timestamps: {
        created: concept.createdAt.toISOString(),
        lastUpdated: concept.updatedAt.toISOString(),
      },
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Debug route error:", error)
    return NextResponse.json(
      { error: "Failed to get concept data" },
      { status: 500 }
    )
  }
}
