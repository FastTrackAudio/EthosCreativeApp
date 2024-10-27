import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Concept = {
  id: string;
  title: string;
  content: string;
};

export function KanbanCard({
  concept,
  courseId,
  sectionId,
}: {
  concept: Concept;
  courseId: string;
  sectionId: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{concept.title}</CardTitle>
        <Link
          href={`/dashboard/my-courses/${courseId}/sections/${sectionId}/concepts/${concept.id}`}
        >
          <Button variant="outline" size="sm">
            Open
          </Button>
        </Link>
      </CardHeader>
    </Card>
  );
}
