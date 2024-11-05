"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ConceptListItemProps {
  title: string;
  description?: string;
  duration?: string;
  thumbnailUrl?: string;
  sectionTitle: string;
  isActive: boolean;
  index: number;
  onClick: () => void;
}

export function ConceptListItem({
  title,
  description,
  duration,
  thumbnailUrl,
  sectionTitle,
  isActive,
  index,
  onClick,
}: ConceptListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={`cursor-pointer hover:bg-accent transition-colors group ${
          isActive ? "bg-accent" : ""
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <div className="flex justify-between items-center mt-2">
              {duration && (
                <span className="text-xs text-muted-foreground">
                  {duration}
                </span>
              )}
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800"
              >
                {sectionTitle.split(" ")[0]}
              </Badge>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
