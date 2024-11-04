"use client"

import { useState } from "react"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import {
  Plus,
  PlusCircle,
  MoreVertical,
  Edit,
  Trash,
  Check,
  X,
} from "lucide-react"
import { KanbanCard } from "./kanban-card"
import { ConceptCard, KanbanSection, CurriculumWeek } from "@/types/kanban"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

interface KanbanBoardProps {
  sections: KanbanSection[]
  cards: ConceptCard[]
  isLoading: boolean
  sectionWidth?: string
  showConceptEditButtons?: boolean
  showCardDescription?: boolean
  showCardImage?: boolean
  editorMode?: boolean
  courseId?: string
  isCurriculumView?: boolean
  curriculumWeeks?: CurriculumWeek[]
  cardUrlPattern?: string
  onCreateSection: (data: { title: string; order: number }) => void
  onUpdateSection: (data: Partial<KanbanSection> & { id: string }) => void
  onDeleteSection: (id: string) => void
  onCreateCard: (data: Partial<ConceptCard> & { sectionId: string }) => void
  onUpdateCard: (data: Partial<ConceptCard> & { id: string }) => void
  onDeleteCard: (id: string) => void
  onAddToCurriculum?: (conceptId: string) => void
  onRemoveFromCurriculum?: (conceptId: string) => void
}

export function KanbanBoard({
  sections,
  cards,
  showCardDescription = true,
  showCardImage = true,
  showConceptEditButtons = true,
  isCurriculumView = false,
  sectionWidth = "min-w-[300px]",
  curriculumWeeks = [],
  editorMode = true,
  cardUrlPattern,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onAddToCurriculum,
  onRemoveFromCurriculum,
}: KanbanBoardProps) {
  const [newConceptTitle, setNewConceptTitle] = useState("")
  const [newConceptDescription, setNewConceptDescription] = useState("")
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingSectionTitle, setEditingSectionTitle] = useState("")

  const isConceptInCurriculum = (conceptId: string): boolean => {
    return curriculumWeeks.some((week) =>
      week.concepts?.some((concept) => concept.id === conceptId)
    )
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId: conceptId } = result

    if (isCurriculumView) {
      onAddToCurriculum?.(conceptId)
    } else {
      onUpdateCard?.({
        id: conceptId,
        sectionId: destination.droppableId,
      })
    }
  }

  const handleEditSection = (section: KanbanSection) => {
    setEditingSectionId(section.id)
    setEditingSectionTitle(section.title)
  }

  const handleSaveSection = () => {
    if (editingSectionId && editingSectionTitle.trim()) {
      onUpdateSection?.({
        id: editingSectionId,
        title: editingSectionTitle.trim(),
      })
      setEditingSectionId(null)
      setEditingSectionTitle("")
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full">
        <div className="h-full overflow-x-auto">
          <div className="flex gap-4 p-4 min-w-max">
            {sections.map((section) => (
              <div
                key={section.id}
                className={cn(
                  "bg-muted rounded-lg flex flex-col h-fit",
                  sectionWidth
                )}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    {editingSectionId === section.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingSectionTitle}
                          onChange={(e) =>
                            setEditingSectionTitle(e.target.value)
                          }
                          className="h-7"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveSection()
                            } else if (e.key === "Escape") {
                              setEditingSectionId(null)
                            }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSaveSection}
                          className="h-7 w-7"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingSectionId(null)}
                          className="h-7 w-7"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium">{section.title}</h3>
                        {!isCurriculumView && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-primary hover:text-primary-foreground"
                              onClick={() => handleEditSection(section)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Trash className="h-4 w-4 mr-2" />
                                      Delete Section
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Section
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        section? This will also delete all
                                        concepts within it. This action cannot
                                        be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          onDeleteSection?.(section.id)
                                        }
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <Droppable droppableId={section.id} type="CONCEPT">
                    {(provided: DroppableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "space-y-2",
                          cards.filter((card) => card.sectionId === section.id)
                            .length === 0 && "min-h-[100px]"
                        )}
                      >
                        {cards
                          .filter((card) => card.sectionId === section.id)
                          .map((card, index) => (
                            <Draggable
                              key={card.id}
                              draggableId={card.id}
                              index={index}
                            >
                              {(
                                provided: DraggableProvided,
                                snapshot: DraggableStateSnapshot
                              ) => (
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
                                    isInCurriculum={isConceptInCurriculum(
                                      card.id
                                    )}
                                    editorMode={editorMode}
                                    cardUrl={
                                      cardUrlPattern
                                        ? cardUrlPattern
                                            .replace(":conceptId", card.id)
                                            .replace(
                                              ":sectionId",
                                              card.sectionId
                                            )
                                        : undefined
                                    }
                                    onAddToCurriculum={onAddToCurriculum}
                                    onRemoveFromCurriculum={
                                      onRemoveFromCurriculum
                                    }
                                    onUpdateCard={onUpdateCard}
                                    onDeleteCard={onDeleteCard}
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

                {!isCurriculumView && (
                  <div className="p-4 border-t border-border">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Concept
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Concept</DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            onCreateCard?.({
                              title: newConceptTitle,
                              sectionId: section.id,
                            })
                            setNewConceptTitle("")
                            setNewConceptDescription("")
                          }}
                          className="space-y-4"
                        >
                          <Input
                            placeholder="Concept Title"
                            value={newConceptTitle}
                            onChange={(e) => setNewConceptTitle(e.target.value)}
                            required
                          />
                          <Textarea
                            placeholder="Concept Description"
                            value={newConceptDescription}
                            onChange={(e) =>
                              setNewConceptDescription(e.target.value)
                            }
                          />
                          <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                              <Button type="button" variant="outline">
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button type="submit">Add Concept</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            ))}

            {!isCurriculumView && onCreateSection && (
              <Button
                variant="outline"
                className="h-fit mt-4"
                onClick={() => onCreateSection({ title: "", order: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            )}
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}
