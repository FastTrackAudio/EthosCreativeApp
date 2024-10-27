import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";

export async function POST(
  req: Request,
  { params }: { params: { conceptId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { content } = await req.json();

  try {
    const updatedConcept = await prisma.concept.update({
      where: {
        id: params.conceptId,
        section: {
          course: {
            userId: user.id,
          },
        },
      },
      data: {
        content,
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

export async function GET(
  request: Request,
  { params }: { params: { conceptId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const concept = await prisma.concept.findUnique({
    where: {
      id: params.conceptId,
    },
    include: {
      section: {
        select: {
          id: true,
          courseId: true,
        },
      },
    },
  });

  if (!concept) {
    return new NextResponse("Concept not found", { status: 404 });
  }

  return NextResponse.json(concept);
}

export async function PATCH(
  request: Request,
  { params }: { params: { conceptId: string } }
) {
  const { content } = await request.json();

  try {
    const updatedConcept = await prisma.concept.update({
      where: { id: params.conceptId },
      data: { content: JSON.stringify(content) },
    });

    return NextResponse.json(updatedConcept);
  } catch (error) {
    console.error("Error updating concept:", error);
    return NextResponse.json(
      { error: "Failed to update concept" },
      { status: 500 }
    );
  }
}
