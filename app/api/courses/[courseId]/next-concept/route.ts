import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the user's curriculum with completions
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
        { weekId: 'asc' },
        { order: 'asc' }
      ],
    });

    // Find the first concept that hasn't been completed
    const nextConcept = curriculum.find(entry => 
      entry.concept.completions.length === 0
    );

    if (!nextConcept) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: nextConcept.concept.id,
      title: nextConcept.concept.title,
      description: nextConcept.concept.description,
      imageUrl: nextConcept.concept.imageUrl,
      sectionId: nextConcept.concept.sectionId,
      sectionTitle: nextConcept.concept.section.title,
    });
  } catch (error) {
    console.error("Error in next-concept route:", error);
    return NextResponse.json(
      { error: "Failed to fetch next concept" },
      { status: 500 }
    );
  }
} 