import React from "react";
import { getAdminCourses } from "./page.server";
import { CourseListWrapper } from "@/features/courses/CourseListWrapper";

export default async function ManageCourses() {
  const initialCourses = await getAdminCourses();

  return (
    <div className="container ~p-4/8 mx-auto max-w-[1400px]">
      <div className="flex justify-between items-center ~mb-4/8">
        <div>
          <h1 className="text-3xl font-bold">Manage Courses</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage all courses in the platform
          </p>
        </div>
      </div>

      <CourseListWrapper initialCourses={initialCourses} />
    </div>
  );
}
