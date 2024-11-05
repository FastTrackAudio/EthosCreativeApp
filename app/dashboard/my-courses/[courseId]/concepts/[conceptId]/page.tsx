"use client";

import { ConceptViewer } from "@/components/courses/concept-viewer";
import { useParams } from "next/navigation";

export default function ConceptPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const conceptId = params.conceptId as string;

  return <ConceptViewer courseId={courseId} conceptId={conceptId} />;
}
