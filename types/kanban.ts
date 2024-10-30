import { Concept, Section } from "@prisma/client";

export interface ConceptCard extends Omit<Concept, "createdAt" | "updatedAt"> {
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanSection
  extends Omit<Section, "createdAt" | "updatedAt"> {
  createdAt: string;
  updatedAt: string;
}

export interface DragEndResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
}

export type SortOption = "custom" | "name" | "created" | "modified";
