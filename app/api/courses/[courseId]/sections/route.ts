import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sections = await prisma.section.findMany({
      where: {
        courseId: params.courseId,
        course: {
          userId: user.id,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error("Failed to fetch sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const newSection = await prisma.section.create({
      data: {
        title,
        description,
        course: {
          connect: {
            id: params.courseId,
            userId: user.id,
          },
        },
      },
    });

    return NextResponse.json(newSection, { status: 201 });
  } catch (error) {
    console.error("Failed to create section:", error);
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}
