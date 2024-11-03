import { KanbanSection } from "@/types/kanban"

import { ConceptCard } from "@/types/kanban"
import { Droppable } from "@hello-pangea/dnd"
import { Draggable } from "react-beautiful-dnd"
import { KanbanCard } from "./kanban-card"

interface KanbanBoardProps {
  sections: KanbanSection[]
  cards: ConceptCard[]
  isLoading?: boolean
  showCardDescription?: boolean
  showCardImage?: boolean
  showConceptEditButtons?: boolean
  isCurriculumView?: boolean
  curriculumWeeks?: any[] // Add proper type
  selectedWeek?: string | null
  onAddToCurriculum?: (conceptId: string) => void
  // ... other props
}

export function KanbanBoard({
  sections,
  cards,
  isLoading,
  showCardDescription = true,
  showCardImage = true,
  showConceptEditButtons = true,
  isCurriculumView = false,
  curriculumWeeks = [],
  onAddToCurriculum,
}: // ... other props
KanbanBoardProps) {
  // Function to check if a concept is already in the curriculum
  const isConceptInCurriculum = (conceptId: string) => {
    return curriculumWeeks.some((week) =>
      week.concepts.some((concept: any) => concept.id === conceptId)
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {sections.map((section) => (
        <Droppable key={section.id} droppableId={section.id}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="bg-muted p-4 rounded-lg min-w-[300px]"
            >
              <div className="flex justify-between items-center mb-4">
                {/* ... section header ... */}
              </div>

              <div className="space-y-3">
                {cards
                  .filter((card) => card.sectionId === section.id)
                  .map((card, index) => (
                    <Draggable
                      key={card.id}
                      draggableId={card.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <KanbanCard
                            card={card}
                            index={index}
                            isDragging={snapshot.isDragging}
                            showDescription={showCardDescription}
                            showImage={showCardImage}
                            showEditButtons={showConceptEditButtons}
                            isCurriculumView={isCurriculumView}
                            isInCurriculum={isConceptInCurriculum(card.id)}
                            onAddToCurriculum={onAddToCurriculum}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      ))}
    </div>
  )
}
