"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DialogClose } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useUploadThing } from "@/lib/uploadthing"
import { ImageUpload } from "@/components/ui/image-upload"

interface CreateCourseFormProps {
  onClose: () => void
}

export function CreateCourseForm({ onClose }: CreateCourseFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleImageChange = (url?: string) => {
    setImageUrl(url || "")
  }

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: {
      title: string
      description: string
      imageUrl?: string
    }) => {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      })
      if (!response.ok) {
        throw new Error("Failed to create course")
      }
      return response.json()
    },
    onMutate: () => {
      onClose() // Close dialog optimistically
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      toast.success("Course created successfully")
      router.push(`/dashboard/admin/manage-courses/${data.id}/manage-sections`)
    },
    onError: (error) => {
      console.error("Failed to create course:", error)
      toast.error("Failed to create course")
    },
  })

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    createCourseMutation.mutate({ title, description, imageUrl })
  }

  return (
    <form onSubmit={handleCreateCourse} className="space-y-4">
      <Input
        placeholder="Course Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="Course Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <ImageUpload
        value={imageUrl}
        onChange={handleImageChange}
        onRemove={() => setImageUrl("")}
      />
      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={createCourseMutation.isPending}>
          {createCourseMutation.isPending ? "Creating..." : "Create Course"}
        </Button>
      </div>
    </form>
  )
}
