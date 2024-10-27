import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  const data = await request.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
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
  { params }: { params: { id: string } }
) {
  const userId = params.id;

  try {
    await prisma.user.delete({
      where: { id: userId },
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
