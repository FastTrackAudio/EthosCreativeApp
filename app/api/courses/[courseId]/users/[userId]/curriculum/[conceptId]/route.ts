import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";

export async function DELETE(
  req: Request,
  {
    params,
  }: { params: { courseId: string; userId: string; conceptId: string } }
) {
  try {
    await prisma.userCurriculum.delete({
      where: {
        userId_courseId_conceptId: {
          userId: params.userId,
          courseId: params.courseId,
          conceptId: params.conceptId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
