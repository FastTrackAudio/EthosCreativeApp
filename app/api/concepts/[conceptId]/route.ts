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
      include: {
        section: true,
        quiz: true,
        curriculum: true,
        completions: true,
      },
    });

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
    const body = await request.json();

    const updateData = {
      ...(body.title && { title: body.title }),
      ...(body.shortTitle !== undefined && { shortTitle: body.shortTitle }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.content && { 
        content: typeof body.content === 'string' 
          ? body.content 
          : JSON.stringify(body.content)
      }),
    };

    const updatedConcept = await prisma.concept.update({
      where: {
        id: params.conceptId,
      },
      data: updateData,
      include: {
        section: true,
      },
    });

    return NextResponse.json(updatedConcept);
  } catch (error) {
    console.error("Error updating concept:", error);
    return NextResponse.json(
      { error: "Error updating concept", details: error },
      { status: 500 }
    );
  }
}
