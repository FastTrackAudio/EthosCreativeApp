"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useState } from "react"
import { MoreVertical, Trash, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditCourseForm } from "./EditCourseForm"
import { CourseCardSkeleton } from "./CourseCardSkeleton"

type Course = {
  id: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export function CourseList({ initialCourses }: { initialCourses: Course[] }) {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const queryClient = useQueryClient()

  const {
    data: courses,
    isLoading,
    error,
  } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await fetch("/api/courses")
      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }
      return response.json()
    },
    initialData: initialCourses,
  })

  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete course")
      }
    },
    onMutate: async (deletedCourseId) => {
      await queryClient.cancelQueries({ queryKey: ["courses"] })
      const previousCourses = queryClient.getQueryData<Course[]>(["courses"])
      queryClient.setQueryData<Course[]>(["courses"], (old) =>
        old ? old.filter((course) => course.id !== deletedCourseId) : []
      )
      return { previousCourses }
    },
    onError: (err, newCourse, context) => {
      queryClient.setQueryData(["courses"], context?.previousCourses)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })

  const updateCourse = useMutation({
    mutationFn: async (updatedCourse: Course) => {
      const response = await fetch(`/api/courses/${updatedCourse.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCourse),
      })
      if (!response.ok) {
        throw new Error("Failed to update course")
      }
      return response.json()
    },
    onMutate: async (newCourse) => {
      await queryClient.cancelQueries({ queryKey: ["courses"] })
      const previousCourses = queryClient.getQueryData<Course[]>(["courses"])
      queryClient.setQueryData<Course[]>(["courses"], (old) =>
        old
          ? old.map((course) =>
              course.id === newCourse.id ? newCourse : course
            )
          : []
      )
      return { previousCourses }
    },
    onError: (err, newCourse, context) => {
      queryClient.setQueryData(["courses"], context?.previousCourses)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error) return <div>Error loading courses</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses?.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{course.description}</p>
            <p>Created: {new Date(course.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(course.updatedAt).toLocaleDateString()}</p>
            <div className="flex justify-between mt-4">
              <Link href={`/dashboard/my-courses/${course.id}`}>
                <Button>Open</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingCourse(course)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteCourse.mutate(course.id)}
                    className="text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
      {editingCourse && (
        <EditCourseForm
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSubmit={(updatedCourse) => {
            updateCourse.mutate(updatedCourse)
            setEditingCourse(null)
          }}
        />
      )}
    </div>
  )
}
