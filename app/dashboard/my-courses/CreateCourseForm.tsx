"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function CreateCourseForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: { title: string; description: string }) => {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });
      if (!response.ok) {
        throw new Error("Failed to create course");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      router.push("/dashboard/my-courses");
    },
    onError: (error) => {
      console.error("Failed to create course:", error);
    },
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    createCourseMutation.mutate({ title, description });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Course</CardTitle>
      </CardHeader>
      <CardContent>
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
          <Button type="submit" disabled={createCourseMutation.isPending}>
            {createCourseMutation.isPending ? "Creating..." : "Create Course"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
