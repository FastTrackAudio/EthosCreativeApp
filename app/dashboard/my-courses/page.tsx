import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserCourses } from "./page.server";
import { CourseListWrapper } from "../../../features/courses/CourseListWrapper";

// This is a Server Component
export default async function MyCourses() {
  const initialCourses = await getUserCourses();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">My Courses</h1>
      <Link href="/dashboard/my-courses/create">
        <Button>Create New Course</Button>
      </Link>
      <CourseListWrapper initialCourses={initialCourses} />
    </div>
  );
}
