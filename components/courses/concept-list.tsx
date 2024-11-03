"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlayCircle, CheckCircle, Lock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { ConceptCompletionStatus } from "./concept-completion-status"
import { Badge } from "@/components/ui/badge"

interface ConceptListProps {
  concepts: {
    id: string
    title: string
    description: string | null
    imageUrl: string | null
    completed: boolean
    locked?: boolean
    sectionTitle: string
    order: number
  }[]
  courseId: string
}

export function ConceptList({ concepts, courseId }: ConceptListProps) {
  // Sort concepts by their curriculum order
  const sortedConcepts = [...concepts].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {sortedConcepts.map((concept) => (
          <ConceptCard key={concept.id} concept={concept} courseId={courseId} />
        ))}
      </div>
    </div>
  )
}

interface ConceptCardProps {
  concept: {
    id: string
    title: string
    description: string | null
    imageUrl: string | null
    completed: boolean
    locked?: boolean
    sectionTitle: string
    order: number
  }
  courseId: string
}

function ConceptCard({ concept, courseId }: ConceptCardProps) {
  const { data: completionStatus } = useQuery({
    queryKey: ["concept-completion", concept.id],
    queryFn: async () => {
      const response = await axios.get(`/api/concepts/${concept.id}/completion`)
      return response.data
    },
  })

  const isCompleted = completionStatus?.completed || false

  return (
    <Card className="relative bg-[color:var(--color-surface-elevated)] hover:border-[color:var(--color-border-contrasted)] transition-[border-color] duration-[var(--transition)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {concept.sectionTitle}
              </Badge>
            </div>
            <CardTitle className="text-xl text-[color:var(--color-text)]">
              {concept.title}
            </CardTitle>
            <CardDescription className="text-[color:var(--color-text-light)]">
              {concept.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <ConceptCompletionStatus conceptId={concept.id} />
            {!concept.locked ? (
              <Button
                asChild
                className="gap-2 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] transition-shadow duration-[var(--transition)]"
                variant={isCompleted ? "secondary" : "default"}
              >
                <Link
                  href={`/dashboard/my-courses/${courseId}/concepts/${concept.id}`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Review
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Start
                    </>
                  )}
                </Link>
              </Button>
            ) : (
              <Button variant="secondary" disabled className="gap-2">
                <Lock className="h-4 w-4" />
                Locked
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {concept.imageUrl && (
        <CardContent>
          <div className="relative aspect-video w-full rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)]">
            <Image
              src={concept.imageUrl}
              alt={concept.title}
              fill
              className="object-cover"
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
}
