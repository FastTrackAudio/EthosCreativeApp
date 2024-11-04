import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

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
  const router = useRouter();

  const navigateBack = () => {
    router.push(`/dashboard/admin/manage-courses/${courseId}/manage-sections`);
  };

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
      toast.success("Concept saved successfully", {
        duration: 2000,
        onAutoClose: () => {
          queryClient.invalidateQueries({ queryKey: ["concepts", courseId] });
          router.push(
            `/dashboard/admin/manage-courses/${courseId}/manage-sections`
          );
        },
      });
    },
    onError: (error) => {
      toast.error("Failed to save concept");
      console.error("Error saving concept:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateConceptMutation.mutateAsync(content);
  };

  return (
    <div className="~space-y-4/6">
      <Button
        variant="ghost"
        onClick={navigateBack}
        className="text-muted-foreground hover:text-foreground ~mb-2/4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Sections
      </Button>

      <form onSubmit={handleSubmit} className="~space-y-3/6">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="~min-h-[150px]/[300px]"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={navigateBack}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateConceptMutation.isPending}
            className="~w-full/auto sm:w-auto"
          >
            {updateConceptMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
