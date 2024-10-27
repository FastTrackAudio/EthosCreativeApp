import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ConceptEditorProps = {
  initialContent: string;
  conceptId: string;
  courseId: string;
};

export function ConceptEditor({
  initialContent,
  conceptId,
  courseId,
}: ConceptEditorProps) {
  const [content, setContent] = useState(initialContent);
  const queryClient = useQueryClient();

  const updateConceptMutation = useMutation({
    mutationFn: async (updatedContent: string) => {
      const response = await fetch(
        `/api/courses/${courseId}/concepts/${conceptId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: updatedContent }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update concept");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concepts", courseId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConceptMutation.mutate(content);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
      />
      <Button type="submit" disabled={updateConceptMutation.isPending}>
        {updateConceptMutation.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
