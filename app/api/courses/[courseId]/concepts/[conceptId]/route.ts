import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; conceptId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, videoUrl, description } = await req.json();

  try {
    const updatedConcept = await prisma.concept.update({
      where: {
        id: params.conceptId,
        section: {
          course: {
            id: params.courseId,
            userId: user.id,
          },
        },
      },
      data: {
        title,
        content,
        videoUrl,
        description,
      },
    });

    return NextResponse.json(updatedConcept);
  } catch (error) {
    console.error("Failed to update concept:", error);
    return NextResponse.json(
      { error: "Failed to update concept" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; conceptId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deletedConcept = await prisma.concept.delete({
      where: {
        id: params.conceptId,
        section: {
          course: {
            id: params.courseId,
            userId: user.id,
          },
        },
      },
    });

    return NextResponse.json(deletedConcept);
  } catch (error) {
    console.error("Failed to delete concept:", error);
    return NextResponse.json(
      { error: "Failed to delete concept" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; conceptId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const concept = await prisma.concept.findUnique({
      where: {
        id: params.conceptId,
        section: {
          course: {
            id: params.courseId,
            userId: user.id,
          },
        },
      },
    });

    if (!concept) {
      return NextResponse.json({ error: "Concept not found" }, { status: 404 });
    }

    return NextResponse.json(concept);
  } catch (error) {
    console.error("Failed to fetch concept:", error);
    return NextResponse.json(
      { error: "Failed to fetch concept" },
      { status: 500 }
    );
  }
}
