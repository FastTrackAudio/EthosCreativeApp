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
import { MoreVertical, Pencil, Trash2, ExternalLink } from "lucide-react"
import { CardDialog } from "./card-dialog"
import { Draggable } from "@hello-pangea/dnd"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface ConceptCardProps {
  card: ConceptCardType
  index: number
  hideImages: boolean
  hideDescriptions: boolean
  onUpdate: (card: Partial<ConceptCardType>) => void
  onDelete: (id: string) => void
}

export function ConceptCard({
  card,
  index,
  hideImages,
  hideDescriptions,
  onUpdate,
  onDelete,
}: ConceptCardProps) {
  const [openView, setOpenView] = useState(false)
  const router = useRouter()

  const handleCardClick = () => {
    router.push(
      `/dashboard/admin/manage-courses/${card.courseId}/sections/${card.sectionId}/concepts/${card.id}`
    )
  }

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Card
              className="mb-3 group cursor-pointer hover:border-primary/50 transition-colors bg-card text-card-foreground"
              onClick={handleCardClick}
            >
              <CardHeader className="p-3 flex flex-row items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--color-text)]">
                  {card.title}
                </h3>
                <div
                  className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()} // Prevent card click when clicking buttons
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenView(true)
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <CardDialog
                    card={card}
                    sectionId={card.sectionId}
                    onSave={onUpdate}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
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
                        onClick={(e) => e.stopPropagation()}
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

      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{card.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {card.imageUrl && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-[300px] object-cover"
                />
              </div>
            )}
            {card.description && (
              <p className="text-muted-foreground">{card.description}</p>
            )}
            <div className="text-sm text-muted-foreground">
              <p>Created: {new Date(card.createdAt).toLocaleString()}</p>
              <p>Last modified: {new Date(card.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
