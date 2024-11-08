"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConceptCard } from "@/types/kanban";
import { PlusCircle } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface CardDialogProps {
  card?: ConceptCard;
  sectionId: string;
  onSave: (card: Partial<ConceptCard> & { sectionId: string }) => void;
  trigger?: React.ReactNode;
}

export function CardDialog({
  card,
  sectionId,
  onSave,
  trigger,
}: CardDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(card?.title ?? "");
  const [shortTitle, setShortTitle] = useState(card?.shortTitle ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [shortDescription, setShortDescription] = useState(
    card?.shortDescription ?? ""
  );
  const [imageUrl, setImageUrl] = useState(card?.imageUrl ?? "");

  const handleSave = () => {
    if (!title.trim()) return;

    const cardData = {
      ...(card?.id ? { id: card.id } : {}),
      title: title.trim(),
      shortTitle: shortTitle.trim() || null,
      description: description.trim() || null,
      shortDescription: shortDescription.trim() || null,
      imageUrl: imageUrl.trim() || null,
      sectionId,
      order: card?.order ?? 0,
    };

    onSave(cardData);
    setOpen(false);

    // Reset form if it's a new card
    if (!card) {
      setTitle("");
      setShortTitle("");
      setDescription("");
      setShortDescription("");
      setImageUrl("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-text)]">
            {card ? "Edit Card" : "Create Card"}
          </DialogTitle>
          <DialogDescription className="text-[var(--color-text-light)]">
            {card
              ? "Edit the card details below."
              : "Add a new card to this section."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-[var(--color-text)]">
              Full Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter full title"
              className="bg-[var(--color-surface)] border-[var(--color-border)]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shortTitle" className="text-[var(--color-text)]">
              Short Title (for cards)
            </Label>
            <Input
              id="shortTitle"
              value={shortTitle}
              onChange={(e) => setShortTitle(e.target.value)}
              placeholder="Enter short title"
              className="bg-[var(--color-surface)] border-[var(--color-border)]"
            />
            <p className="text-xs text-muted-foreground">
              Optional - will use full title if not provided
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-[var(--color-text)]">
              Full Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter full description"
              className="bg-[var(--color-surface)] border-[var(--color-border)]"
            />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="shortDescription"
              className="text-[var(--color-text)]"
            >
              Short Description (for cards)
            </Label>
            <Textarea
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Enter short description"
              className="bg-[var(--color-surface)] border-[var(--color-border)]"
            />
            <p className="text-xs text-muted-foreground">
              Optional - will use full description if not provided
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image" className="text-[var(--color-text)]">
              Image
            </Label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              disabled={false}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

