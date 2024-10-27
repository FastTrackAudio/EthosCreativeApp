"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Concept = {
  id: string;
  title: string;
};

export function ConceptList({
  initialConcepts,
  sectionId,
}: {
  initialConcepts: Concept[];
  sectionId: string;
}) {
  const { data: concepts } = useQuery<Concept[]>({
    queryKey: ["concepts", sectionId],
    queryFn: async () => {
      const response = await fetch(`/api/sections/${sectionId}/concepts`);
      if (!response.ok) {
        throw new Error("Failed to fetch concepts");
      }
      return response.json();
    },
    initialData: initialConcepts,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Concepts</h2>
      {concepts.map((concept) => (
        <div key={concept.id} className="border p-4 rounded">
          <h3 className="text-lg font-medium">{concept.title}</h3>
          <Link
            href={`/dashboard/my-courses/${sectionId}/concepts/${concept.id}`}
          >
            <Button className="mt-2">View Concept</Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
