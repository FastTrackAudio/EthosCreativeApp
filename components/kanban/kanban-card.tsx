"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreVertical, X, ExternalLink } from "lucide-react";
import Image from "next/image";
import { ConceptCard } from "@/types/kanban";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { CardDialog } from "./card-dialog";
import Link from "next/link";

interface KanbanCardProps {
  card: ConceptCard;
  index: number;
  isDragging: boolean;
  showDescription?: boolean;
  showImage?: boolean;
  showEditButtons?: boolean;
  isCurriculumView?: boolean;
  isInCurriculum?: boolean;
  isWeekView?: boolean;
  editorMode?: boolean;
  cardUrl?: string;
  onAddToCurriculum?: (conceptId: string) => void;
  onRemoveFromCurriculum?: (conceptId: string) => void;
  onUpdateCard?: (data: Partial<ConceptCard> & { id: string }) => void;
  onDeleteCard?: (id: string) => void;
  onUpdateImage?: (imageUrl: string) => void;
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
}: KanbanCardProps) {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    const isButton = target.closest("button");
    const isDialog = target.closest('[role="dialog"]');
    const isMenuItem = target.closest('[role="menuitem"]');
    const isDragHandle = target.closest("[data-rfd-drag-handle-draggable-id]");

    if (
      isButton ||
      isDialog ||
      isMenuItem ||
      isDragHandle ||
      isCurriculumView
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (cardUrl) {
      router.push(cardUrl);
    }
  };

  return (
    <div
      className={cn(
        "group transition-all duration-300",
        "w-full min-w-[280px] ~max-w-[320px]/[400px]"
      )}
    >
      <Card
        className={cn(
          "relative transition-all duration-[var(--transition)]",
          "~p-3/5",
          "bg-[color:var(--color-surface-elevated)]",
          "hover:border-[color:var(--color-border-contrasted)]",
          isDragging && "ring-2 ring-primary/20"
        )}
        onClick={handleCardClick}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between ~gap-2/4">
            <h3 className="text-sm font-medium line-clamp-2 flex-1">
              {card.shortTitle || card.title}
            </h3>
            <div className="flex items-center gap-1 pointer-events-auto">
              {showEditButtons && !isCurriculumView && !isWeekView && (
                <>
                  {cardUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      asChild
                    >
                      <Link href={cardUrl.replace('/preview', '')}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <CardDialog
                        card={card}
                        sectionId={card.sectionId}
                        onSave={async (data) => {
                          const updateData = {
                            ...data,
                            id: card.id,
                          };
                          onUpdateCard?.(updateData);
                        }}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Edit Concept
                          </DropdownMenuItem>
                        }
                      />
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
                </>
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
            </div>
          </div>

          {showDescription && (card.shortDescription || card.description) && (
            <p className="~text-xs/sm text-muted-foreground line-clamp-3">
              {card.shortDescription || card.description}
            </p>
          )}

          {showImage && card.imageUrl && (
            <div className="relative w-full h-32 max-h-[128px] overflow-hidden rounded-md">
              <Image
                src={card.imageUrl}
                alt={card.title}
                fill
                className="object-cover"
                sizes="(max-width: 400px) 100vw, 400px"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
