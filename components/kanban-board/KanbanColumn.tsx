import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { KanbanCard } from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddConceptModal } from "../../features/courses/concepts/AddConceptModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Section = {
  id: string;
  title: string;
  description: string | null;
};

type Concept = {
  id: string;
  title: string;
  content: string;
};

export function KanbanColumn({
  section,
  concepts,
  courseId,
}: {
  section: Section;
  concepts: Concept[];
  courseId: string;
}) {
  const [isAddingConceptOpen, setIsAddingConceptOpen] = useState(false);
  const queryClient = useQueryClient();

  const addConceptMutation = useMutation({
    mutationFn: async (newConcept: { title: string; content: string }) => {
      const response = await fetch(
        `/api/courses/${courseId}/sections/${section.id}/concepts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newConcept),
        }
      );
      if (!response.ok) throw new Error("Failed to add concept");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concepts", courseId] });
      setIsAddingConceptOpen(false);
    },
  });

  const handleAddConcept = (newConcept: { title: string; content: string }) => {
    addConceptMutation.mutate(newConcept);
  };

  return (
    <Card className="w-80 flex-shrink-0">
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {concepts.map((concept) => (
          <KanbanCard
            key={concept.id}
            concept={concept}
            courseId={courseId}
            sectionId={section.id}
          />
        ))}
        <Button onClick={() => setIsAddingConceptOpen(true)}>
          Add Concept
        </Button>
      </CardContent>
      {isAddingConceptOpen && (
        <AddConceptModal
          onClose={() => setIsAddingConceptOpen(false)}
          onAdd={handleAddConcept}
        />
      )}
    </Card>
  );
}
