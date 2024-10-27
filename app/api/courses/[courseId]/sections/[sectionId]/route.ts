import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First, check if the section belongs to the user's course
    const section = await prisma.section.findFirst({
      where: {
        id: params.sectionId,
        courseId: params.courseId,
        course: {
          userId: user.id,
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Delete all concepts in the section
    await prisma.concept.deleteMany({
      where: {
        sectionId: params.sectionId,
      },
    });

    // Delete the section
    await prisma.section.delete({
      where: {
        id: params.sectionId,
      },
    });

    return NextResponse.json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("Failed to delete section:", error);
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description } = await req.json();

  try {
    const updatedSection = await prisma.section.update({
      where: {
        id: params.sectionId,
        courseId: params.courseId,
        course: {
          userId: user.id,
        },
      },
      data: {
        title,
        description,
      },
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error("Failed to update section:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}
