import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function DELETE(
  request: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete the section (cascade will handle concepts)
    await prisma.section.delete({
      where: {
        id: params.sectionId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SECTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 