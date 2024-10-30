"use client"

import { useSections } from "@/hooks/use-sections"
import { useCards } from "@/hooks/use-cards"
import { KanbanBoard } from "@/components/kanban/kanban-board"

export default function Home() {
  const {
    sections,
    isLoading: sectionsLoading,
    createSection,
    updateSection,
    deleteSection,
  } = useSections()

  const { cards, isLoading: cardsLoading, updateCard, deleteCard } = useCards()

  return (
    <KanbanBoard
      sections={sections ?? []}
      cards={cards ?? []}
      isLoading={sectionsLoading || cardsLoading}
      onCreateSection={createSection.mutate}
      onUpdateSection={updateSection.mutate}
      onDeleteSection={deleteSection.mutate}
      onUpdateCard={updateCard.mutate}
      onDeleteCard={deleteCard.mutate}
    />
  )
}
