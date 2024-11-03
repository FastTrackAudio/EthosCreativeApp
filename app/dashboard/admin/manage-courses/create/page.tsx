"use client"

import { CreateCourseForm } from "@/features/courses/CreateCourseForm"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic"
export const runtime = "edge"

export default function CreateCoursePage() {
  const router = useRouter()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create a New Course</h1>
      <CreateCourseForm onClose={() => router.back()} />
    </div>
  )
}
