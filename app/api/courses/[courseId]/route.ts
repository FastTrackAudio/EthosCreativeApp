import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
  });

  if (!course) {
    return new NextResponse("Course not found", { status: 404 });
  }

  return NextResponse.json(course);
}

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    await prisma.course.delete({
      where: {
        id: params.courseId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COURSE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
