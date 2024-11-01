"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash, X } from "lucide-react"
import Image from "next/image"
import { ConceptCard } from "@/types/kanban"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DialogClose } from "@/components/ui/dialog"
import { ImageUpload } from "@/components/ui/image-upload"

interface KanbanCardProps {
  card: ConceptCard
  isDragging: boolean
  showDescription?: boolean
  showImage?: boolean
  showEditButtons?: boolean
  isCurriculumView?: boolean
  isInCurriculum?: boolean
  isWeekView?: boolean
  onAddToCurriculum?: (conceptId: string) => void
  onRemoveFromCurriculum?: (conceptId: string) => void
  onUpdateCard?: (data: Partial<ConceptCard> & { id: string }) => void
  onDeleteCard?: (id: string) => void
  onUpdateImage?: (imageUrl: string) => void
}

export function KanbanCard({
  card,
  isDragging,
  showDescription = true,
  showImage = true,
  showEditButtons = true,
  isCurriculumView = false,
  isInCurriculum = false,
  isWeekView = false,
  onAddToCurriculum,
  onRemoveFromCurriculum,
  onUpdateCard,
  onDeleteCard,
  onUpdateImage,
}: KanbanCardProps) {
  const [editTitle, setEditTitle] = useState(card.title)
  const [editDescription, setEditDescription] = useState(card.description || "")
  const [editImage, setEditImage] = useState(card.imageUrl || "")

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateCard?.({
      id: card.id,
      title: editTitle,
      description: editDescription,
      imageUrl: editImage,
    })
  }

  return (
    <div
      className={cn(
        "p-3 rounded-lg shadow-sm transition-all hover:ring-2 hover:ring-primary/20",
        isDragging && "shadow-lg",
        isWeekView ? "bg-card" : "bg-background",
        isInCurriculum && !isWeekView && "bg-muted"
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-sm font-medium">{card.title}</h3>
        <div className="flex items-center gap-1">
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
            <div className="flex items-center gap-1">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Edit className="h-4 w-4" />
                  </Button>
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
                    <ImageUpload
                      value={editImage}
                      onChange={setEditImage}
                      onRemove={() => setEditImage("")}
                    />
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
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Trash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Concept</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this concept? This action
                      cannot be undone.
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
            </div>
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
  )
}
