"use client"

import { KanbanBoard } from "@/components/kanban/kanban-board"
import { useKanban } from "@/hooks/use-kanban"

export default function ManageSectionsPage({
  params,
}: {
  params: { courseId: string }
}) {
  const {
    sections,
    concepts,
    isLoading,
    createSection,
    updateSection,
    deleteSection,
    createConcept,
    updateConcept,
    deleteConcept,
  } = useKanban(params.courseId)

  return (
    <KanbanBoard
      sections={sections ?? []}
      cards={concepts ?? []}
      isLoading={isLoading}
      onCreateSection={createSection.mutate}
      onUpdateSection={updateSection.mutate}
      onDeleteSection={deleteSection.mutate}
      onCreateCard={createConcept.mutate}
      onUpdateCard={updateConcept.mutate}
      onDeleteCard={deleteConcept.mutate}
    />
  )
}
