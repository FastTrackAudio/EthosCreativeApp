import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const sections = await prisma.section.findMany({
    where: { courseId: params.courseId },
    orderBy: { order: "asc" },
  })
  return NextResponse.json(sections)
}

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const data = await request.json()
  const section = await prisma.section.create({
    data: {
      ...data,
      courseId: params.courseId,
    },
  })
  return NextResponse.json(section)
}
