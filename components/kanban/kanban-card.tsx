"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus, MoreVertical, X, ExternalLink } from "lucide-react"
import Image from "next/image"
import { ConceptCard } from "@/types/kanban"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface KanbanCardProps {
  card: ConceptCard
  index: number
  isDragging: boolean
  showDescription?: boolean
  showImage?: boolean
  showEditButtons?: boolean
  isCurriculumView?: boolean
  isInCurriculum?: boolean
  isWeekView?: boolean
  editorMode?: boolean
  cardUrl?: string
  onAddToCurriculum?: (conceptId: string) => void
  onRemoveFromCurriculum?: (conceptId: string) => void
  onUpdateCard?: (data: Partial<ConceptCard> & { id: string }) => void
  onDeleteCard?: (id: string) => void
  onUpdateImage?: (imageUrl: string) => void
}

export function KanbanCard({
  card,
  index,
  isDragging,
  showDescription = true,
  showImage = true,
  showEditButtons = true,
  isCurriculumView = false,
  isInCurriculum = false,
  isWeekView = false,
  editorMode = true,
  cardUrl,
  onAddToCurriculum,
  onRemoveFromCurriculum,
  onUpdateCard,
  onDeleteCard,
  onUpdateImage,
}: KanbanCardProps) {
  const router = useRouter()
  const [editTitle, setEditTitle] = useState(card.title)
  const [editDescription, setEditDescription] = useState(card.description || "")
  const [editImage, setEditImage] = useState(card.imageUrl || "")

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement

    const isButton = target.closest("button")
    const isDialog = target.closest('[role="dialog"]')
    const isMenuItem = target.closest('[role="menuitem"]')
    const isDragHandle = target.closest("[data-rfd-drag-handle-draggable-id]")

    if (
      isButton ||
      isDialog ||
      isMenuItem ||
      isDragHandle ||
      isCurriculumView
    ) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    if (cardUrl) {
      console.log("Navigating to:", cardUrl)
      router.push(cardUrl)
    }
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateCard?.({
      id: card.id,
      title: editTitle,
      description: editDescription,
      imageUrl: editImage,
    })
  }

  const handleImageChange = (url?: string) => {
    setEditImage(url || "")
  }

  return (
    <div
      className={cn(
        "p-3 rounded-lg shadow-sm transition-all hover:ring-2 hover:ring-primary/20 cursor-pointer",
        isDragging && "shadow-lg",
        isWeekView ? "bg-card" : "bg-background",
        isInCurriculum && !isWeekView && "bg-muted"
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      data-card-id={card.id}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick(e as unknown as React.MouseEvent<HTMLDivElement>)
        }
      }}
    >
      <div className="pointer-events-none">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-medium">{card.title}</h3>
          <div className="flex items-center gap-1 pointer-events-auto">
            {cardUrl && !isCurriculumView && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => router.push(cardUrl)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            {isCurriculumView && !isWeekView && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 hover:bg-muted",
                  isInCurriculum && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => onAddToCurriculum?.(card.id)}
                disabled={isInCurriculum}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {isWeekView && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onRemoveFromCurriculum?.(card.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {showEditButtons && !isCurriculumView && !isWeekView && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit Concept
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Concept</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEdit} className="space-y-4">
                        <Input
                          placeholder="Concept Title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          required
                        />
                        <Textarea
                          placeholder="Concept Description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                        <div className="space-y-2">
                          <ImageUpload
                            value={editImage}
                            onChange={(url) => setEditImage(url || "")}
                            disabled={false}
                          />
                          {editImage && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => setEditImage("")}
                            >
                              Remove Image
                            </Button>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <DialogClose asChild>
                            <Button type="button" variant="outline">
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button type="submit">Save Changes</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        Delete Concept
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Concept</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this concept? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteCard?.(card.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {showDescription && card.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {card.description}
          </p>
        )}

        {showImage && card.imageUrl && (
          <div className="mt-2">
            <Image
              src={card.imageUrl}
              alt={card.title}
              width={300}
              height={200}
              className="rounded-md object-cover"
            />
          </div>
        )}
      </div>
    </div>
  )
}
