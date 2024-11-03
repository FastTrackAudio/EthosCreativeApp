"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlayCircle, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface NextConceptCardProps {
  concept: {
    id: string
    title: string
    description: string | null
    imageUrl: string | null
    sectionId: string
    sectionTitle: string
  }
  courseId: string
}

export function NextConceptCard({ concept, courseId }: NextConceptCardProps) {
  if (!concept) return null

  return (
    <Card className="bg-[color:var(--color-surface-elevated)] border-[color:var(--color-border)] shadow-[var(--shadow-lg)]">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[color:var(--color-accent)]" />
              <p className="text-sm font-medium text-[color:var(--color-accent)]">
                Continue Learning
              </p>
            </div>
            <CardTitle className="text-2xl text-[color:var(--color-text)]">
              {concept.title}
            </CardTitle>
            <CardDescription className="text-[color:var(--color-text-light)]">
              From section: {concept.sectionTitle}
            </CardDescription>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link
              href={`/dashboard/my-courses/${courseId}/concepts/${concept.id}`}
            >
              <PlayCircle className="h-5 w-5" />
              Start Now
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex gap-6">
        {concept.imageUrl && (
          <div className="relative aspect-video w-64 rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)]">
            <Image
              src={concept.imageUrl}
              alt={concept.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <p className="text-[color:var(--color-text-light)] line-clamp-3">
            {concept.description || "No description available"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
