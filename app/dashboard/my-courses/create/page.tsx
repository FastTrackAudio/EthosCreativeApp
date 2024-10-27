import React from "react";
import { CreateCourseForm } from "../../../../features/courses/CreateCourseForm";

export default function CreateCoursePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create a New Course</h1>
      <CreateCourseForm />
    </div>
  );
}
