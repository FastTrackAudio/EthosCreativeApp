"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditSectionForm } from "./EditSectionForm";

type Section = {
  id: string;
  title: string;
  description: string | null;
};

export function SectionList({
  initialSections,
  courseId,
}: {
  initialSections: Section[];
  courseId: string;
}) {
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const { data: sections } = useQuery<Section[]>({
    queryKey: ["sections", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/sections`);
      if (!response.ok) {
        throw new Error("Failed to fetch sections");
      }
      return response.json();
    },
    initialData: initialSections,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Sections</h2>
      {sections.map((section) => (
        <div key={section.id} className="border p-4 rounded">
          <h3 className="text-lg font-medium">{section.title}</h3>
          <p>{section.description}</p>
          <div className="flex space-x-2 mt-2">
            <Link
              href={`/dashboard/my-courses/${courseId}/sections/${section.id}`}
            >
              <Button>View Section</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setEditingSection(section)}
            >
              Edit
            </Button>
          </div>
        </div>
      ))}
      {editingSection && (
        <EditSectionForm
          section={editingSection}
          courseId={courseId}
          onClose={() => setEditingSection(null)}
          onSubmit={(updatedSection) => {
            // Implement the logic to update the section
            // For example, you might call an API or update local state
            console.log("Updated section:", updatedSection);
            setEditingSection(null);
          }}
        />
      )}
    </div>
  );
}
