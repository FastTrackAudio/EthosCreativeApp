import React from "react";
import { getUserCourses } from "./page.server";
import { StudentCourseListWrapper } from "@/features/courses/StudentCourseListWrapper";

export default async function MyCourses() {
  const initialCourses = await getUserCourses();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          Continue learning from where you left off
        </p>
      </div>
      <StudentCourseListWrapper initialCourses={initialCourses} />
    </div>
  );
}
