"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { ConceptCard } from "@/components/kanban/concept-card";
import { cn } from "@/lib/utils";

interface CurriculumWeeksProps {
  weeks: any[];
  isLoading: boolean;
  selectedWeek: string | null;
  onSelectWeek: (weekId: string | null) => void;
  onUpdateWeek: (weekId: string, concepts: any[]) => void;
}

export function CurriculumWeeks({
  weeks,
  isLoading,
  selectedWeek,
  onSelectWeek,
  onUpdateWeek,
}: CurriculumWeeksProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((weekNum) => {
        const weekId = `week-${weekNum}`;
        return (
          <Card
            key={weekNum}
            className={cn(
              "p-3 cursor-pointer transition",
              selectedWeek === weekId && "border-primary"
            )}
            onClick={() =>
              onSelectWeek(selectedWeek === weekId ? null : weekId)
            }
          >
            <h3 className="text-sm font-medium mb-2">Week {weekNum}</h3>
            <Droppable droppableId={weekId} type="CARD">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[100px] space-y-2"
                >
                  {weeks
                    .filter((item) => item.weekId === weekId)
                    .map((item, index) => (
                      <ConceptCard
                        key={item.conceptId}
                        card={item.concept}
                        index={index}
                        hideDescriptions={true}
                        hideImages={true}
                        showEditButtons={false}
                        onUpdate={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Card>
        );
      })}
    </div>
  );
}
