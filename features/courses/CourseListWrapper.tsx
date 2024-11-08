"use client";

import React from "react";
import { type Course } from "@/types";
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
  Plus,
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
import { CreateCourseForm } from "./CreateCourseForm";
import { formatDate } from "@/lib/utils";
import {
  CourseCard,
  CourseCardHeader,
  CourseCardContent,
  CourseCardTitle,
  CourseCardDescription,
} from "@/components/ui/course-card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ExtendedCourse {
  id: string;
  title: string;
  description: string | null;
  imageUrl?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  published?: boolean;
  _count?: {
    enrollments: number;
    sections: number;
  };
  user?: {
    firstName: string;
    lastName: string;
  };
}

interface CourseListWrapperProps {
  userId?: string;
  isAdmin?: boolean;
  initialCourses?: ExtendedCourse[];
}

interface EditCourseDialogProps {
  course: ExtendedCourse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditCourseDialog({ course, open, onOpenChange }: EditCourseDialogProps) {
  const [title, setTitle] = React.useState(course.title);
  const [description, setDescription] = React.useState(course.description || "");
  const [imageUrl, setImageUrl] = React.useState(course.imageUrl || "");
  const queryClient = useQueryClient();

  const updateCourseMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string | null;
      imageUrl: string | null;
    }) => {
      const response = await axios.patch(`/api/courses/${course.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course updated successfully");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update course");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCourseMutation.mutate({
      title,
      description,
      imageUrl,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Make changes to your course here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Course title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Course description"
            />
          </div>

          <div className="space-y-2">
            <Label>Course Image</Label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              onRemove={() => setImageUrl("")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateCourseMutation.isPending}
            >
              {updateCourseMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CourseListWrapper({
  userId,
  isAdmin,
  initialCourses = [],
}: CourseListWrapperProps) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const isAdminView = pathname.includes("/admin/manage-courses");
  const [editingCourse, setEditingCourse] = React.useState<ExtendedCourse | null>(null);

  const { data: courses = initialCourses, isLoading } = useQuery<
    ExtendedCourse[]
  >({
    queryKey: ["courses", isAdminView ? "admin" : userId],
    queryFn: async () => {
      const endpoint = isAdminView ? "/api/courses/admin" : "/api/courses";
      const queryString = !isAdminView && userId ? `?userId=${userId}` : "";

      const response = await fetch(`${endpoint}${queryString}`);
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="~space-y-4/6">
      <div className="flex justify-between items-center">
        <h2 className="~text-xl/3xl font-bold">Courses</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <CreateCourseForm onClose={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ~gap-4/6 w-full">
        {courses.map((course) => (
          <div className="w-full" key={course.id}>
            <CourseCard>
              <CourseCardHeader>
                <div className="flex justify-between items-start ~gap-2/3">
                  <div className="~space-y-1/2">
                    <CourseCardTitle>{course.title}</CourseCardTitle>
                    <CourseCardDescription>
                      {course.description}
                    </CourseCardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuItem onClick={() => setEditingCourse(course)}>
                        Edit Course
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
                              This action cannot be undone. This will
                              permanently delete the course and all associated
                              data including sections, concepts, and
                              enrollments.
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
              </CourseCardHeader>

              <CourseCardContent>
                <div className="grid grid-cols-2 ~gap-2/4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[color:var(--color-text-lightest)]" />
                    <span className="text-sm text-[color:var(--color-text-light)]">
                      {course._count?.enrollments || 0} Students
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[color:var(--color-text-lightest)]" />
                    <span className="text-sm text-[color:var(--color-text-light)]">
                      {course._count?.sections || 0} Sections
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[color:var(--color-text-lightest)]" />
                    <span className="text-sm text-[color:var(--color-text-light)]">
                      {formatDate(course.createdAt)}
                    </span>
                  </div>
                  <div>
                    <Badge
                      variant={course.published ? "default" : "secondary"}
                      className="bg-[color:var(--color-surface)] text-[color:var(--color-text-light)]"
                    >
                      {course.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </CourseCardContent>
              <CardFooter className="card-button-group border-t border-[var(--card-border-color)] ~py-2/4 px-3/6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="card-button-responsive"
                    >
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
                <Button asChild className="card-button-responsive">
                  <Link
                    href={`/dashboard/admin/manage-courses/${course.id}/manage-sections`}
                    className="flex items-center justify-center gap-2"
                  >
                    Edit Course
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </CourseCard>
          </div>
        ))}
      </div>

      {editingCourse && (
        <EditCourseDialog
          course={editingCourse}
          open={!!editingCourse}
          onOpenChange={(open) => {
            if (!open) setEditingCourse(null);
          }}
        />
      )}
    </div>
  );
}
