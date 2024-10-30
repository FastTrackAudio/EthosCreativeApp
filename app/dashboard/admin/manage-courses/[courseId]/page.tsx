import React from "react"
import { notFound } from "next/navigation"
import prisma from "@/app/utils/db"
import { KanbanBoard } from "@/components/kanban-board/KanbanBoard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pencil, ArrowLeft } from "lucide-react"

export default async function AdminCourseManagementPage({
  params,
}: {
  params: { courseId: string }
}) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      sections: {
        include: {
          concepts: true,
        },
      },
    },
  })

  if (!course) {
    notFound()
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Link
            href="/dashboard/admin/manage-courses"
            className="flex items-center hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/admin/manage-courses/${course.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Course
              </Button>
            </Link>
            <Link
              href={`/dashboard/admin/manage-courses/${course.id}/sections/create`}
            >
              <Button size="sm">Add Section</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Course Structure</h2>
          <p className="text-sm text-muted-foreground">
            Manage sections and concepts using the Kanban board below
          </p>
        </div>
        <KanbanBoard courseId={course.id} isAdminView={true} />
      </div>
    </div>
  )
}
