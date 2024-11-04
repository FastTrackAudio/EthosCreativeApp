import { ConceptContent } from "@/components/courses/concept-content"

export default function ConceptEditorPage({
  params,
}: {
  params: { courseId: string; conceptId: string }
}) {
  return (
    <ConceptContent
      conceptId={params.conceptId}
      courseId={params.courseId}
      editorMode={true}
    />
  )
}
