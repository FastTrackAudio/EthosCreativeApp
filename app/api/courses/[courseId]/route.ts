import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // First, delete all concepts associated with the course
    await prisma.concept.deleteMany({
      where: {
        section: {
          courseId: params.courseId,
        },
      },
    });

    // Then, delete all sections associated with the course
    await prisma.section.deleteMany({
      where: {
        courseId: params.courseId,
      },
    });

    // Finally, delete the course
    await prisma.course.delete({
      where: {
        id: params.courseId,
        userId: user.id,
      },
    });

    return new NextResponse("Course deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting course:", error);
    return new NextResponse("Error deleting course", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description } = await req.json();

  try {
    // First, check if the course belongs to the user
    const course = await prisma.course.findUnique({
      where: {
        id: params.courseId,
        userId: user.id,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Update the course
    const updatedCourse = await prisma.course.update({
      where: { id: params.courseId },
      data: {
        title,
        description,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Failed to update course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}
