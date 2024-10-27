"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateSectionForm({ courseId }: { courseId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const createSectionMutation = useMutation({
    mutationFn: async (sectionData: { title: string; description: string }) => {
      const response = await fetch(`/api/courses/${courseId}/sections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sectionData),
      });
      if (!response.ok) {
        throw new Error("Failed to create section");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
      setTitle("");
      setDescription("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSectionMutation.mutate({ title, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold">Create New Section</h2>
      <Input
        placeholder="Section Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="Section Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button type="submit" disabled={createSectionMutation.isPending}>
        {createSectionMutation.isPending ? "Creating..." : "Create Section"}
      </Button>
    </form>
  );
}
