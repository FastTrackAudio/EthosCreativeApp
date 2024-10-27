"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateConceptForm({ sectionId }: { sectionId: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const createConceptMutation = useMutation({
    mutationFn: async (conceptData: { title: string; content: string }) => {
      const response = await fetch(`/api/sections/${sectionId}/concepts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conceptData),
      });
      if (!response.ok) {
        throw new Error("Failed to create concept");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concepts", sectionId] });
      setTitle("");
      setContent("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createConceptMutation.mutate({ title, content });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold">Create New Concept</h2>
      <Input
        placeholder="Concept Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="Concept Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <Button type="submit" disabled={createConceptMutation.isPending}>
        {createConceptMutation.isPending ? "Creating..." : "Create Concept"}
      </Button>
    </form>
  );
}
