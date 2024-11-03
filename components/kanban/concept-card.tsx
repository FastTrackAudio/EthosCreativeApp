"use client"

import { useState } from "react"
import { ConceptCard as ConceptCardType } from "@/types/kanban"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, Plus } from "lucide-react"
import { CardDialog } from "./card-dialog"
import { Draggable } from "@hello-pangea/dnd"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ConceptCardProps {
  card: ConceptCardType
  index: number
  maxWidth?: string
  showEditButtons?: boolean
  hideImages: boolean
  hideDescriptions: boolean
  isCurriculumView?: boolean
  isInCurriculum?: boolean
  onUpdate: (card: Partial<ConceptCardType>) => void
  onDelete: (id: string) => void
  onAddToCurriculum?: (conceptId: string) => void
}

export function ConceptCard({
  card,
  index,
  maxWidth,
  showEditButtons = true,
  hideImages,
  hideDescriptions,
  isCurriculumView = false,
  isInCurriculum = false,
  onUpdate,
  onDelete,
  onAddToCurriculum,
}: ConceptCardProps) {
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking buttons
    if (e.target instanceof HTMLElement && e.target.closest("button")) {
      return
    }

    // Get courseId from URL
    const pathSegments = window.location.pathname.split("/")
    const courseId = pathSegments[pathSegments.indexOf("manage-courses") + 1]

    router.push(
      `/dashboard/admin/manage-courses/${courseId}/concepts/${card.id}`
    )
  }

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn("group", maxWidth)}
        >
          <Card
            className="mb-3 group hover:border-primary/50 transition-colors bg-card text-card-foreground cursor-pointer"
            onClick={handleCardClick}
          >
            <CardHeader className="p-3 space-y-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-medium flex-1">{card.title}</h4>
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {showEditButtons && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CardDialog
                        card={card}
                        sectionId={card.sectionId}
                        onSave={(data) => onUpdate({ ...data, id: card.id })}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(card.id)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            {((!hideDescriptions && card.description) ||
              (card.imageUrl && !hideImages)) && (
              <CardContent className="p-3 pt-0">
                {card.imageUrl && !hideImages && (
                  <div className="mb-2 rounded-md overflow-hidden border border-[var(--color-border)]">
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
                {card.description && !hideDescriptions && (
                  <p className="text-sm text-[var(--color-text-light)] line-clamp-2">
                    {card.description}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </Draggable>
  )
}
