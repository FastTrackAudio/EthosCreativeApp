import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; userId: string } }
) {
  try {
    const curriculum = await prisma.userCurriculum.findMany({
      where: {
        userId: params.userId,
        courseId: params.courseId,
      },
      include: {
        concept: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({ weeks: curriculum });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; userId: string } }
) {
  try {
    const { conceptId, weekId, order } = await req.json();

    const curriculum = await prisma.userCurriculum.create({
      data: {
        userId: params.userId,
        courseId: params.courseId,
        conceptId,
        weekId,
        order,
      },
    });

    return NextResponse.json(curriculum);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
