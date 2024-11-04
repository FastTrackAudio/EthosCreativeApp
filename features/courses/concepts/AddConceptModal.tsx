import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AddConceptModalProps = {
  onClose: () => void;
  onAdd: (newConcept: {
    title: string;
    content: string;
    imageUrl?: string;
  }) => void;
};

export function AddConceptModal({ onClose, onAdd }: AddConceptModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ title, content, imageUrl });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="~w-[90vw]/[600px] ~max-w-[90vw]/[600px]">
        <DialogHeader>
          <DialogTitle className="~text-lg/2xl">Add New Concept</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="~space-y-3/6">
            <Input
              placeholder="Concept Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="~text-sm/base"
              required
            />
            <Textarea
              placeholder="Concept Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="~min-h-[100px]/[200px] ~text-sm/base"
              required
            />
            <Input
              type="url"
              placeholder="Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="~text-sm/base"
            />
          </div>
          <DialogFooter className="~mt-4/8">
            <div className="flex flex-col sm:flex-row ~gap-2/4 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Add Concept
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
