import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getAdminCourses } from "./page.server"
import { CourseListWrapper } from "@/features/courses/CourseListWrapper"

export default async function ManageCourses() {
  const initialCourses = await getAdminCourses()

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Manage Courses</h1>
      <Link href="/dashboard/admin/manage-courses/create">
        <Button>Create New Course</Button>
      </Link>
      <CourseListWrapper initialCourses={initialCourses} />
    </div>
  )
}
