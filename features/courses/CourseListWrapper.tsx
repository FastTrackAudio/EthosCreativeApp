"use client"

import React from "react"
import { Course } from "@prisma/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MoreVertical,
  Users,
  BookOpen,
  Calendar,
  ArrowUpRight,
  UserPlus,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ManageCourseUsers } from "./ManageCourseUsers"

interface ExtendedCourse extends Course {
  _count?: {
    enrollments: number
  }
}

interface CourseListWrapperProps {
  initialCourses: ExtendedCourse[]
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course: ExtendedCourse) => (
        <Card key={course.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle>{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link
                      href={`/dashboard/admin/manage-courses/${course.id}/edit`}
                      className="flex items-center w-full"
                    >
                      Edit Course
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href={`/dashboard/admin/manage-courses/${course.id}/sections`}
                      className="flex items-center w-full"
                    >
                      Manage Sections
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Delete Course
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {course._count?.enrollments || 0} Students
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] w-[1200px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Manage Course Students</DialogTitle>
                      <DialogDescription>
                        Manage student enrollments for {course.title}
                      </DialogDescription>
                    </DialogHeader>
                    <ManageCourseUsers courseId={course.id} />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">12 Sections</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <Badge variant={course.published ? "default" : "secondary"}>
                  {course.published ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button asChild className="w-full">
              <Link
                href={`/dashboard/admin/manage-courses/${course.id}`}
                className="flex items-center gap-2"
              >
                Manage Course
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
