import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: { conceptId: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the current completion status
    const existingCompletion = await prisma.conceptCompletion.findFirst({
      where: {
        conceptId: params.conceptId,
        userId: user.id,
      },
    });

    // Get the curriculum entry to update
    const curriculumEntry = await prisma.userCurriculum.findFirst({
      where: {
        conceptId: params.conceptId,
        userId: user.id,
      },
      include: {
        concept: {
          select: {
            section: {
              select: {
                courseId: true
              }
            }
          }
        }
      }
    });

    if (!curriculumEntry) {
      return new NextResponse("Curriculum entry not found", { status: 404 });
    }

    const courseId = curriculumEntry.concept.section.courseId;

    // If completion exists, delete it and mark curriculum as incomplete
    if (existingCompletion) {
      await prisma.$transaction([
        prisma.conceptCompletion.delete({
          where: {
            id: existingCompletion.id,
          },
        }),
        prisma.userCurriculum.update({
          where: {
            userId_courseId_conceptId: {
              userId: user.id,
              courseId: courseId,
              conceptId: params.conceptId,
            },
          },
          data: {
            isCompleted: false,
          },
        }),
      ]);

      return NextResponse.json({ completed: false });
    }

    // If no completion exists, create it and mark curriculum as complete
    await prisma.$transaction([
      prisma.conceptCompletion.create({
        data: {
          userId: user.id,
          conceptId: params.conceptId,
        },
      }),
      prisma.userCurriculum.update({
        where: {
          userId_courseId_conceptId: {
            userId: user.id,
            courseId: courseId,
            conceptId: params.conceptId,
          },
        },
        data: {
          isCompleted: true,
        },
      }),
    ]);

    return NextResponse.json({ completed: true });
  } catch (error) {
    console.error("[CONCEPT_TOGGLE_COMPLETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 