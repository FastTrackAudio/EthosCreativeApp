"use client"

import { Button } from "@/components/ui/button"
import { KanbanCard } from "../kanban/kanban-card"
import { Droppable, Draggable } from "@hello-pangea/dnd"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { ConceptCard } from "@/types/kanban"

interface Week {
  weekId: string
  concepts: ConceptCard[]
}

interface CurriculumWeeksProps {
  weeks: Week[]
  isLoading: boolean
  selectedWeek: string | null
  onSelectWeek: (weekId: string) => void
  onUpdateWeek: (weekId: string) => void
  onRemoveFromCurriculum?: (conceptId: string) => void
  onReorderConcepts?: (weekId: string, concepts: ConceptCard[]) => void
}

export function CurriculumWeeks({
  weeks = [],
  isLoading,
  selectedWeek,
  onSelectWeek,
  onUpdateWeek,
  onRemoveFromCurriculum,
  onReorderConcepts,
}: CurriculumWeeksProps) {
  const [localWeeks, setLocalWeeks] = useState<Week[]>([])
  const [maxWeek, setMaxWeek] = useState(1)

  // Initialize local state from props
  useEffect(() => {
    if (weeks.length > 0) {
      const highestWeek = Math.max(...weeks.map((w) => parseInt(w.weekId)))
      setMaxWeek(highestWeek)
      setLocalWeeks(weeks)
    }
  }, [weeks])

  const handleAddWeek = () => {
    const newWeekNumber = maxWeek + 1
    console.log("Adding new week:", newWeekNumber)

    // Add new week to local state
    const newWeek = {
      weekId: newWeekNumber.toString(),
      concepts: []
    }
    
    setMaxWeek(newWeekNumber)
    setLocalWeeks(prev => [...prev, newWeek])
    
    // Notify parent
    onUpdateWeek(newWeekNumber.toString())
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      {localWeeks.map((week) => (
        <div
          key={week.weekId}
          className={cn(
            "p-4 rounded-lg border transition-colors",
            selectedWeek === week.weekId
              ? "border-primary bg-primary/5"
              : "border-border bg-card text-card-foreground"
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Week {week.weekId}</h3>
            <Button
              variant={selectedWeek === week.weekId ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onSelectWeek(week.weekId)
              }}
            >
              {selectedWeek === week.weekId ? "Selected" : "Select"}
            </Button>
          </div>
          <Droppable droppableId={`week-${week.weekId}`}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2 min-h-[100px]"
              >
                {week.concepts?.map((concept, index) => (
                  <Draggable
                    key={concept.id}
                    draggableId={concept.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <KanbanCard
                          key={concept.id}
                          card={concept}
                          index={index}
                          isDragging={snapshot.isDragging}
                          showDescription={false}
                          showImage={false}
                          showEditButtons={false}
                          isWeekView={true}
                          onRemoveFromCurriculum={onRemoveFromCurriculum}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ))}

      <Button 
        variant="outline" 
        className="w-full" 
        onClick={handleAddWeek}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Week {maxWeek + 1}
      </Button>
    </div>
  )
}
