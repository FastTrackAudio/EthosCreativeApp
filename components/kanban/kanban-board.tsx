"use client"

import { DragDropContext } from "@hello-pangea/dnd"
import { Section } from "@/components/kanban/section"
import { Button } from "@/components/ui/button"
import { PlusCircle, ArrowUpDown, ImageOff, Type } from "lucide-react"
import { DragEndResult, SortOption } from "@/types/kanban"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SectionSkeleton } from "@/components/kanban/loading-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { ConceptCard, Section as SectionType } from "@/types/kanban"

interface KanbanBoardProps {
  title?: string
  description?: string
  sections: SectionType[]
  cards: ConceptCard[]
  isLoading: boolean
  onCreateSection: (data: { title: string; order: number }) => void
  onUpdateSection: (data: Partial<SectionType> & { id: string }) => void
  onDeleteSection: (id: string) => void
  onCreateCard: (data: Partial<ConceptCard> & { sectionId: string }) => void
  onUpdateCard: (data: Partial<ConceptCard> & { id: string }) => void
  onDeleteCard: (id: string) => void
}

export function KanbanBoard({
  title = "Course Content",
  description = "Organize your course content using drag and drop",
  sections,
  cards,
  isLoading,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
}: KanbanBoardProps) {
  const [sortBy, setSortBy] = useState<SortOption>("custom")
  const [isDragging, setIsDragging] = useState(false)
  const [hideImages, setHideImages] = useState(false)
  const [hideDescriptions, setHideDescriptions] = useState(false)

  const handleDragEnd = (result: DragEndResult) => {
    setIsDragging(false)
    if (!result.destination) return

    const { destination, source, draggableId, type } = result

    if (type === "CARD") {
      const card = cards?.find((c) => c.id === draggableId)
      if (!card) return

      if (destination.droppableId !== source.droppableId) {
        onUpdateCard({
          id: card.id,
          sectionId: destination.droppableId,
          order: destination.index,
        })
      } else if (destination.index !== source.index) {
        onUpdateCard({
          id: card.id,
          order: destination.index,
        })
      }
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleCreateSection = () => {
    const order = sections?.length ?? 0
    onCreateSection({
      title: `Section ${order + 1}`,
      order,
    })
  }

  const sortCards = (cardsToSort: ConceptCard[] | undefined) => {
    if (!cardsToSort || isDragging) return cardsToSort

    return [...cardsToSort].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title)
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case "modified":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        default:
          return a.order - b.order
      }
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="flex gap-4 items-start">
          {[1, 2, 3].map((i) => (
            <SectionSkeleton key={i} />
          ))}
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
              {title}
            </h1>
            <p className="text-[var(--color-text-light)]">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setHideImages(!hideImages)}
            >
              <ImageOff
                className={`h-4 w-4 ${
                  hideImages ? "text-muted-foreground" : ""
                }`}
              />
              {hideImages ? "Show Images" : "Hide Images"}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setHideDescriptions(!hideDescriptions)}
            >
              <Type
                className={`h-4 w-4 ${
                  hideDescriptions ? "text-muted-foreground" : ""
                }`}
              />
              {hideDescriptions ? "Show Descriptions" : "Hide Descriptions"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort Cards
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortOption)}
                >
                  <DropdownMenuRadioItem value="custom">
                    Custom (Default)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name">
                    Name
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="created">
                    Date Created
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="modified">
                    Date Modified
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <div className="flex gap-4 items-start">
          {sections?.map((section) => (
            <Section
              key={section.id}
              section={section}
              cards={sortCards(
                cards?.filter((card) => card.sectionId === section.id)
              )}
              hideImages={hideImages}
              hideDescriptions={hideDescriptions}
              onUpdateSection={onUpdateSection}
              onDeleteSection={onDeleteSection}
              onCreateCard={onCreateCard}
              onUpdateCard={onUpdateCard}
              onDeleteCard={onDeleteCard}
            />
          ))}

          <Button
            variant="outline"
            className="flex items-center gap-2 border-[var(--color-border-transparent)] 
            hover:border-[var(--color-border-contrasted)] bg-[var(--color-surface)] 
            text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors"
            onClick={handleCreateSection}
          >
            <PlusCircle className="h-4 w-4" />
            Add Section
          </Button>
        </div>
      </DragDropContext>
    </div>
  )
}
