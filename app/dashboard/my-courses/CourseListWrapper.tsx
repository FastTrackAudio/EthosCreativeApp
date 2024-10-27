"use client";

import React from "react";
import { CourseList } from "./CourseList";

type Course = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export function CourseListWrapper({
  initialCourses,
}: {
  initialCourses: Course[];
}) {
  return <CourseList initialCourses={initialCourses} />;
}
