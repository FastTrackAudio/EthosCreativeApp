"use client";

import React from "react";
import { Course } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Users,
  BookOpen,
  Calendar,
  ArrowUpRight,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ManageCourseUsers } from "./ManageCourseUsers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from "axios";

interface ExtendedCourse extends Course {
  _count?: {
    enrollments: number;
  };
}

interface CourseListWrapperProps {
  initialCourses: ExtendedCourse[];
}

export function CourseListWrapper({ initialCourses }: CourseListWrapperProps) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isAdminView = pathname.includes("/admin");

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await fetch(
        isAdminView ? "/api/courses/admin" : "/api/courses"
      );
      if (!response.ok) throw new Error("Failed to fetch courses");
      return response.json();
    },
    initialData: initialCourses,
  });

  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      await axios.delete(`/api/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        Delete Course
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the course and all associated data including
                          sections, concepts, and enrollments.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteCourse.mutate(course.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
                  <DialogTrigger>
                    <UserPlus className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </DialogTrigger>
                  <DialogContent className="max-w-screen w-full max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Manage Course Users</DialogTitle>
                      <DialogDescription>
                        Add or remove users from this course
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
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            {isAdminView && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-screen w-full max-h-[95vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Manage Course Users</DialogTitle>
                    <DialogDescription>
                      Add or remove users from this course
                    </DialogDescription>
                  </DialogHeader>
                  <ManageCourseUsers courseId={course.id} />
                </DialogContent>
              </Dialog>
            )}
            <Button asChild className="w-full sm:flex-1 lg:w-auto">
              <Link
                href={
                  isAdminView
                    ? `/dashboard/admin/manage-courses/${course.id}/manage-sections`
                    : `/dashboard/my-courses/${course.id}`
                }
              >
                {isAdminView ? "Manage Course" : "View Course"}
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
