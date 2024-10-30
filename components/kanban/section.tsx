"use client"

import { useState } from "react"
import {
  Section as SectionType,
  ConceptCard as ConceptCardType,
} from "@/types/kanban"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Droppable } from "@hello-pangea/dnd"
import { ConceptCard } from "./concept-card"
import { CardDialog } from "./card-dialog"
import { MoreVertical, Pencil, Save, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SectionProps {
  section: SectionType
  cards: ConceptCardType[]
  onUpdateSection: (section: Partial<SectionType>) => void
  onDeleteSection: (id: string) => void
  onCreateCard: (data: Partial<ConceptCardType> & { sectionId: string }) => void
  onUpdateCard: (card: Partial<ConceptCardType>) => void
  onDeleteCard: (id: string) => void
}

export function Section({
  section,
  cards,
  onUpdateSection,
  onDeleteSection,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
}: SectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(section.title)

  const handleSave = () => {
    if (title.trim()) {
      onUpdateSection({ ...section, title: title.trim() })
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setTitle(section.title)
    setIsEditing(false)
  }

  return (
    <Card className="w-80 flex flex-col">
      <CardHeader className="p-3 space-y-0">
        <div className="flex items-center justify-between">
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSave}
                className="h-8 w-8"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancel}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-medium">{section.title}</h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDeleteSection(section.id)}
                    >
                      Delete Section
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </CardHeader>
      <Droppable droppableId={section.id} type="CARD">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 p-3 pt-0"
          >
            {cards.map((card, index) => (
              <ConceptCard
                key={card.id}
                card={card}
                index={index}
                onUpdate={onUpdateCard}
                onDelete={onDeleteCard}
              />
            ))}
            {provided.placeholder}
            <CardDialog
              sectionId={section.id}
              onSave={(data) =>
                onCreateCard({ ...data, sectionId: section.id })
              }
            />
          </div>
        )}
      </Droppable>
    </Card>
  )
}
