import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
  })

  if (!course) {
    return new NextResponse("Course not found", { status: 404 })
  }

  return NextResponse.json(course)
}
