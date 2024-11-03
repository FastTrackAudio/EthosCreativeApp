import React from "react"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { StudentCourseListWrapper } from "@/features/courses/StudentCourseListWrapper"
import prisma from "@/app/utils/db"
import { redirect } from "next/navigation"

export default async function MyCourses() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch enrolled courses with all necessary data
  const enrolledCourses = await prisma.course.findMany({
    where: {
      enrollments: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      sections: {
        include: {
          _count: {
            select: {
              concepts: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
      enrollments: {
        where: {
          userId: user.id,
        },
        take: 1,
      },
    },
  })

  // Transform the data to match the StudentCourseListWrapper interface
  const transformedCourses = enrolledCourses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    enrolledAt:
      course.enrollments[0]?.enrolledAt.toISOString() ||
      new Date().toISOString(),
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    sectionCount: course.sections.length,
    conceptCount: course.sections.reduce(
      (acc, section) => acc + (section._count?.concepts || 0),
      0
    ),
    studentCount: course._count.enrollments,
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          Continue learning from where you left off
        </p>
      </div>
      <StudentCourseListWrapper initialCourses={transformedCourses} />
    </div>
  )
}
