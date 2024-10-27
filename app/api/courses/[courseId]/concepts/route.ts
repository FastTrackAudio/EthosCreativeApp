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
    const concepts = await prisma.concept.findMany({
      where: {
        section: {
          courseId: params.courseId,
          course: {
            userId: user.id,
          },
        },
      },
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
