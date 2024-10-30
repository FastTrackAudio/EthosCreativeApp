import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

export async function GET(
  request: Request,
  { params }: { params: { conceptId: string } }
) {
  try {
    const concept = await prisma.concept.findUnique({
      where: {
        id: params.conceptId,
      },
    })

    console.log("Retrieved concept from DB:", concept)

    if (!concept) {
      return NextResponse.json({ error: "Concept not found" }, { status: 404 })
    }

    // Ensure content is properly formatted
    let formattedContent
    try {
      formattedContent = concept.content
        ? JSON.parse(concept.content as string)
        : {
            version: "1",
            blocks: [],
          }

      console.log("Formatted content:", formattedContent)
    } catch (e) {
      console.error("Error parsing content from DB:", e)
      formattedContent = {
        version: "1",
        blocks: [],
      }
    }

    const response = {
      ...concept,
      content: JSON.stringify(formattedContent),
    }

    console.log("Sending response:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching concept:", error)
    return NextResponse.json(
      { error: "Error fetching concept" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { conceptId: string } }
) {
  try {
    const body = await request.json()
    console.log("Received PATCH request body:", body)

    const updatedConcept = await prisma.concept.update({
      where: {
        id: params.conceptId,
      },
      data: {
        content: body.content,
      },
    })

    console.log("Updated concept in DB:", updatedConcept)
    return NextResponse.json(updatedConcept)
  } catch (error) {
    console.error("Error updating concept:", error)
    return NextResponse.json(
      { error: "Error updating concept" },
      { status: 500 }
    )
  }
}
