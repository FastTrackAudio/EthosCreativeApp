"use client";

import Image from "next/image";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ConceptListItemProps {
  title: string;
  shortTitle?: string | null;
  description?: string;
  shortDescription?: string | null;
  duration?: string;
  thumbnailUrl?: string;
  sectionTitle: string;
  isActive: boolean;
  isCompleted?: boolean;
  index: number;
  onClick: () => void;
  onToggleComplete?: () => void;
}

export function ConceptListItem({
  title,
  shortTitle,
  description,
  shortDescription,
  duration,
  thumbnailUrl,
  sectionTitle,
  isActive,
  isCompleted,
  index,
  onClick,
  onToggleComplete,
}: ConceptListItemProps) {
  const displayTitle = shortTitle || title;
  const displayDescription = shortDescription || description;

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleComplete?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-3"
    >
      <Card
        className={`cursor-pointer hover:bg-accent transition-colors group ${
          isActive ? "bg-accent" : ""
        } max-w-[350px] relative min-h-[100px]`}
        onClick={onClick}
      >
        {isCompleted !== undefined && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-6 w-6 p-0.5"
            onClick={handleToggleComplete}
          >
            <CheckCircle2 
              className={`h-4 w-4 transition-colors ${
                isCompleted ? "text-green-500" : "text-muted-foreground"
              }`} 
            />
          </Button>
        )}

        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <CardContent className="p-3 flex items-start gap-3">
          <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={displayTitle}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col h-full pr-6">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {displayTitle}
              </h3>
            </div>
            
            {displayDescription && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-6">
                {displayDescription}
              </p>
            )}

            <div className="absolute bottom-3 right-3">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 scale-75 origin-right"
              >
                {sectionTitle.split(" ")[0]}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
