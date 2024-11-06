import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

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

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, imageUrl } = body;

    // Verify user owns the course
    const course = await prisma.course.findUnique({
      where: {
        id: params.courseId,
      },
      select: {
        userId: true,
      },
    });

    if (!course || course.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedCourse = await prisma.course.update({
      where: {
        id: params.courseId,
      },
      data: {
        title,
        description,
        imageUrl,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    return new NextResponse("Error updating course", { status: 500 });
  }
}
