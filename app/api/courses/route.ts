import { NextResponse } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/app/utils/db"

export async function GET() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const courses = await prisma.course.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Failed to fetch courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, description } = await req.json()

  try {
    const course = await prisma.course.create({
      data: {
        title,
        description,
        userId: user.id,
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error("Failed to create course:", error)
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    )
  }
}
