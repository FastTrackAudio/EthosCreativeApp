import { Concept, Section } from "@prisma/client"

export interface ConceptCard {
  id: string
  title: string
  description?: string
  imageUrl?: string
  sectionId: string
}

export interface KanbanSection {
  id: string
  title: string
  description?: string
  courseId: string
}

export interface DragEndResult {
  draggableId: string
  type: string
  source: {
    droppableId: string
    index: number
  }
  destination?: {
    droppableId: string
    index: number
  }
}

export type SortOption = "custom" | "name" | "created" | "modified"
