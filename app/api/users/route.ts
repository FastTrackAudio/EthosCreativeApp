import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";

export async function GET() {
  try {
    console.log("Fetching users from database");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        enrolled: true,
        permissions: true,
        artistPageUrl: true,
        dateJoined: true,
        profileImage: true,
      },
    });
    console.log("Fetched users:", users);

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", details: error.message },
      { status: 500 }
    );
  }
}
