import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content } = await req.json();

  try {
    const newConcept = await prisma.concept.create({
      data: {
        title,
        content,
        section: {
          connect: {
            id: params.sectionId,
            course: {
              id: params.courseId,
              userId: user.id,
            },
          },
        },
      },
    });

    return NextResponse.json(newConcept, { status: 201 });
  } catch (error) {
    console.error("Failed to create concept:", error);
    return NextResponse.json(
      { error: "Failed to create concept" },
      { status: 500 }
    );
  }
}
