import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";

export async function GET(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const concepts = await prisma.concept.findMany({
      where: { sectionId: params.sectionId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(concepts);
  } catch (error) {
    console.error("Failed to fetch concepts:", error);
    return NextResponse.json(
      { error: "Failed to fetch concepts" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content } = await req.json();

  try {
    const concept = await prisma.concept.create({
      data: {
        title,
        content,
        sectionId: params.sectionId,
      },
    });

    return NextResponse.json(concept, { status: 201 });
  } catch (error) {
    console.error("Failed to create concept:", error);
    return NextResponse.json(
      { error: "Failed to create concept" },
      { status: 500 }
    );
  }
}
