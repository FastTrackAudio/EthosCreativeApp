import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";

export async function POST(
  request: Request,
  { params }: { params: { courseId: string; userId: string } }
) {
  try {
    console.log("Adding new week to curriculum", params);
    const { weekId } = await request.json();

    // Just return success - we'll let the UI maintain the week structure
    return NextResponse.json({ weekId });
  } catch (error) {
    console.error("Error adding curriculum week:", error);
    return new NextResponse("Error adding curriculum week", { status: 500 });
  }
}

// When removing concepts, don't delete the week if it has a placeholder
export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string; userId: string } }
) {
  try {
    const { conceptId } = await request.json();
    
    // Check if this is a placeholder concept
    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
    });

    if (!concept?.title.includes('Placeholder')) {
      // Only delete non-placeholder concepts
      await prisma.userCurriculum.delete({
        where: {
          userId_courseId_conceptId: {
            userId: params.userId,
            courseId: params.courseId,
            conceptId: conceptId,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from curriculum:", error);
    return new NextResponse("Error removing from curriculum", { status: 500 });
  }
}
