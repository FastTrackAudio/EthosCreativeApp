"use client"

import React from "react"
import { Course } from "@prisma/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

interface CourseListWrapperProps {
  initialCourses: Course[]
}

export function CourseListWrapper({ initialCourses }: CourseListWrapperProps) {
  const pathname = usePathname()
  const isAdminView = pathname.includes("/admin")

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await fetch(
        isAdminView ? "/api/courses/admin" : "/api/courses"
      )
      if (!response.ok) throw new Error("Failed to fetch courses")
      return response.json()
    },
    initialData: initialCourses,
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <div key={course.id} className="p-4 border rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold">{course.title}</h3>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <Link
            href={
              isAdminView
                ? `/dashboard/admin/manage-courses/${course.id}/manage-sections`
                : `/dashboard/my-courses/${course.id}`
            }
          >
            <Button variant="default" className="w-full">
              {isAdminView ? "Manage Course" : "View Course"}
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}
