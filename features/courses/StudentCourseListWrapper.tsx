"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  ArrowRight,
  BookOpenCheck,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"

interface EnrolledCourse {
  id: string
  title: string
  description: string | null
  enrolledAt: string
  createdAt: string
  updatedAt: string
  sectionCount: number
  conceptCount: number
  studentCount: number
}

interface StudentCourseListWrapperProps {
  initialCourses: EnrolledCourse[]
}

export function StudentCourseListWrapper({
  initialCourses,
}: StudentCourseListWrapperProps) {
  const { data: courses } = useQuery({
    queryKey: ["enrolled-courses"],
    queryFn: async () => {
      const response = await fetch("/api/courses/enrolled")
      if (!response.ok) throw new Error("Failed to fetch courses")
      return response.json()
    },
    initialData: initialCourses,
  })

  if (!courses.length) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-semibold mb-2">No Enrolled Courses</h3>
        <p className="text-muted-foreground mb-4">
          You haven't enrolled in any courses yet.
        </p>
        <Button asChild>
          <Link href="/dashboard/courses/explore">Explore Courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course: EnrolledCourse) => (
        <Card key={course.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle>{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {course.sectionCount} Sections
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {course.conceptCount} Concepts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(course.enrolledAt), "MM/dd/yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {course.studentCount} Students
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>0%</span>
                </div>
                <Progress value={0} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button asChild className="w-full">
              <Link
                href={`/dashboard/my-courses/${course.id}`}
                className="flex items-center justify-center gap-2"
              >
                Continue Learning
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
