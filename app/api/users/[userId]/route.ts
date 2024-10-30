import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        permissions: true,
        artistPageUrl: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const data = await request.json();
    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: data,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await prisma.user.delete({
      where: { id: params.userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
