"use client";

import { DragDropContext } from "@hello-pangea/dnd";
import { Section } from "@/components/kanban/section";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowUpDown, ImageOff, Type } from "lucide-react";
import { DragEndResult, SortOption } from "@/types/kanban";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SectionSkeleton } from "@/components/kanban/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { ConceptCard, Section as SectionType } from "@/types/kanban";

interface KanbanBoardProps {
  sections: SectionType[];
  cards: ConceptCard[];
  curriculumWeeks: any[];
  isLoading: boolean;
  isCurriculumView?: boolean;
  sectionWidth?: string;
  conceptMaxWidth?: string;
  showConceptEditButtons?: boolean;
  showCardDescription?: boolean;
  showCardImage?: boolean;
  onCreateSection: (data: { title: string; order: number }) => void;
  onUpdateSection: (data: Partial<SectionType> & { id: string }) => void;
  onDeleteSection: (id: string) => void;
  onCreateCard: (data: Partial<ConceptCard> & { sectionId: string }) => void;
  onUpdateCard: (data: Partial<ConceptCard> & { id: string }) => void;
  onDeleteCard: (id: string) => void;
  onAddToCurriculum: (sectionId: string) => void;
  onRemoveFromCurriculum: (sectionId: string) => void;
}

export function KanbanBoard({
  sections,
  cards,
  curriculumWeeks,
  isLoading,
  isCurriculumView = false,
  sectionWidth = "min-w-[350px]",
  conceptMaxWidth,
  showConceptEditButtons = true,
  showCardDescription = true,
  showCardImage = true,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onAddToCurriculum,
  onRemoveFromCurriculum,
}: KanbanBoardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (result: DragEndResult) => {
    setIsDragging(false);
    if (!result.destination) return;

    const destinationId = result.destination.droppableId;
    const conceptId = result.draggableId;

    if (isCurriculumView && destinationId.startsWith("week-")) {
      onAddToCurriculum?.({
        conceptId,
        weekId: destinationId,
        order: result.destination.index,
      });
      return;
    }

    onUpdateCard({
      id: conceptId,
      sectionId: destinationId,
      order: result.destination.index,
    });
  };

  if (isLoading) {
    return <SectionSkeleton />;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-[calc(100vh-12rem)] overflow-x-auto">
        <div className="flex gap-4 pb-4 min-w-max">
          {sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              cards={cards.filter((card) => card.sectionId === section.id)}
              className={sectionWidth}
              conceptMaxWidth={conceptMaxWidth}
              showConceptEditButtons={showConceptEditButtons}
              showCardDescription={showCardDescription}
              showCardImage={showCardImage}
              onUpdateSection={onUpdateSection}
              onDeleteSection={onDeleteSection}
              onCreateCard={onCreateCard}
              onUpdateCard={onUpdateCard}
              onDeleteCard={onDeleteCard}
            />
          ))}
          <button
            onClick={() =>
              onCreateSection({
                title: `Section ${sections.length + 1}`,
                order: sections.length,
              })
            }
            className={`h-fit ${sectionWidth} rounded-lg border-2 border-dashed border-muted-foreground/20 p-4 hover:border-muted-foreground/50 transition`}
          >
            Add Section
          </button>
        </div>
      </div>
    </DragDropContext>
  );
}
