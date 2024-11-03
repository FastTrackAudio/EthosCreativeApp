import { Concept, Section as PrismaSection } from "@prisma/client"

export interface ConceptCard {
  id: string
  title: string
  description?: string | null
  imageUrl?: string | null
  order: number
  sectionId: string
  createdAt: string
  updatedAt: string
  courseId: string
}

export interface Section {
  id: string
  title: string
  description?: string | null
  order: number
  courseId: string
  concepts: ConceptCard[]
}

export interface KanbanSection {
  id: string
  title: string
  description?: string | null
  order: number
  courseId: string
  concepts: ConceptCard[]
}

export interface CurriculumWeek {
  id: string
  title: string
  concepts: ConceptCard[]
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
