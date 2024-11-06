import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";

export async function POST(
  request: Request,
  { params }: { params: { courseId: string; userId: string } }
) {
  try {
    console.log("Adding new week to curriculum", params);
    const { weekId } = await request.json();

    // Just return success - we'll let the UI maintain the week structure
    return NextResponse.json({ weekId });
  } catch (error) {
    console.error("Error adding curriculum week:", error);
    return new NextResponse("Error adding curriculum week", { status: 500 });
  }
}
