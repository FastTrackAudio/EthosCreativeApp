import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: { conceptId: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find existing completion
    const existingCompletion = await prisma.conceptCompletion.findUnique({
      where: {
        userId_conceptId: {
          userId: user.id,
          conceptId: params.conceptId,
        },
      },
    });

    if (existingCompletion) {
      // Toggle existing completion
      const updated = await prisma.conceptCompletion.update({
        where: {
          id: existingCompletion.id,
        },
        data: {
          completed: !existingCompletion.completed,
        },
      });
      return NextResponse.json(updated);
    } else {
      // Create new completion record
      const completion = await prisma.conceptCompletion.create({
        data: {
          userId: user.id,
          conceptId: params.conceptId,
          completed: true,
        },
      });
      return NextResponse.json(completion);
    }
  } catch (error) {
    console.error("Error toggling concept completion:", error);
    return new NextResponse("Error toggling completion", { status: 500 });
  }
} 