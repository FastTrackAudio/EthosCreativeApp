export interface ConceptCard {
  id: string
  title: string
  description?: string
  imageUrl?: string
  order: number
  sectionId: string
  createdAt: string
  updatedAt: string
}

export interface Section {
  id: string
  title: string
  order: number
  createdAt: string
  updatedAt: string
}

export type SortOption = "custom" | "name" | "created" | "modified"

export type DragEndResult = {
  destination?: {
    droppableId: string
    index: number
  }
  source: {
    droppableId: string
    index: number
  }
  draggableId: string
  type: string
}
