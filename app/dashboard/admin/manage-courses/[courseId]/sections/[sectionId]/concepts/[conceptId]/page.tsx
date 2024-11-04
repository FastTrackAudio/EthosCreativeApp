"use client";

import { ConceptContent } from "@/components/courses/concept-content";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConceptEditorPage({
  params,
}: {
  params: { courseId: string; sectionId: string; conceptId: string };
}) {
  const router = useRouter();

  const navigateBack = () => {
    router.push(
      `/dashboard/admin/manage-courses/${params.courseId}/manage-sections`
    );
  };

  return (
    <div className="container ~p-4/8 mx-auto max-w-[1400px]">
      <Button
        variant="ghost"
        onClick={navigateBack}
        className="text-muted-foreground hover:text-foreground ~mb-6/8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Sections
      </Button>

      <ConceptContent
        conceptId={params.conceptId}
        courseId={params.courseId}
        editorMode={true}
      />
    </div>
  );
}
