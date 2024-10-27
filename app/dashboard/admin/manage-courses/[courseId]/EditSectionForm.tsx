"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Section = {
  id: string;
  title: string;
  description: string | null;
};

type EditSectionFormProps = {
  section: Section;
  courseId: string;
  onClose: () => void;
  onSubmit: (updatedSection: Section) => void;
};

export function EditSectionForm({
  section,
  courseId,
  onClose,
  onSubmit,
}: EditSectionFormProps) {
  const [title, setTitle] = useState(section.title);
  const [description, setDescription] = useState(section.description || "");
  const queryClient = useQueryClient();

  const editSectionMutation = useMutation({
    mutationFn: async (updatedSection: Partial<Section>) => {
      const response = await fetch(
        `/api/courses/${courseId}/sections/${section.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSection),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update section");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...section, title, description });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Section</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={editSectionMutation.isPending}>
              {editSectionMutation.isPending ? "Updating..." : "Update Section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
