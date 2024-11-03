import { ConceptCard } from "@/types/kanban"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import Image from "next/image"

interface KanbanCardProps {
  card: ConceptCard
  index: number
  isDragging: boolean
  showDescription?: boolean
  showImage?: boolean
  showEditButtons?: boolean
  isCurriculumView?: boolean
  isInCurriculum?: boolean
  onAddToCurriculum?: (conceptId: string) => void
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
  onAddToCurriculum,
}: KanbanCardProps) {
  return (
    <div
      className={cn(
        "bg-card p-3 rounded-lg shadow-sm",
        isDragging && "shadow-lg",
        isInCurriculum && "opacity-50"
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-sm font-medium">{card.title}</h3>
        <div className="flex items-center gap-1">
          {isCurriculumView && !isInCurriculum && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onAddToCurriculum?.(card.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {showEditButtons && (
            <>
              <DropdownMenu>
                {/* ... existing dropdown menu content ... */}
              </DropdownMenu>
            </>
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
