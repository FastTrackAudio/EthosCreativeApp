"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ConceptCompletionStatus } from "./concept-completion-status"
import { revalidatePath } from "next/cache"
import { getKindeServerSession } from "kinde-auth-kit"
import { prisma } from "@/lib/prisma"
import { params } from "next/navigation"

interface Section {
  id: string
  title: string
  description: string | null
  concepts: {
    id: string
    title: string
    description: string | null
    imageUrl: string | null
    completed: boolean
  }[]
}

interface NextConcept {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  sectionId: string
  sectionTitle: string
}

interface EnrolledCourseViewProps {
  courseId: string
  courseTitle: string
  courseDescription?: string | null
  sections: {
    id: string
    title: string
    description?: string | null
    concepts: {
      id: string
      title: string
      description?: string | null
      imageUrl?: string | null
      completed: boolean
    }[]
  }[]
  nextConcept?: {
    id: string
    title: string
    description?: string | null
    imageUrl?: string | null
    sectionId: string
    sectionTitle: string
  } | null
  onCompleteAction: (conceptId: string, courseId: string) => Promise<void>
}

export function EnrolledCourseView({
  courseId,
  courseTitle,
  courseDescription,
  sections,
  nextConcept,
  onCompleteAction,
}: EnrolledCourseViewProps) {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Course Header */}
      <div>
        <h1 className="text-3xl font-bold">{courseTitle}</h1>
        {courseDescription && (
          <p className="text-muted-foreground mt-2">{courseDescription}</p>
        )}
      </div>

      {/* Next Concept Card */}
      {nextConcept && (
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Continue Learning</span>
              <Button asChild variant="secondary" className="ml-auto" size="sm">
                <Link
                  href={`/dashboard/my-courses/${nextConcept.sectionId}/concepts/${nextConcept.id}`}
                >
                  Start Next Concept
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardTitle>
            <CardDescription className="text-primary-foreground/70">
              Up Next in {nextConcept.sectionTitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-6">
            {nextConcept.imageUrl && (
              <div className="relative w-[200px] h-[120px] rounded-md overflow-hidden">
                <Image
                  src={nextConcept.imageUrl}
                  alt={nextConcept.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold mb-2">{nextConcept.title}</h3>
              {nextConcept.description && (
                <p className="text-primary-foreground/70 line-clamp-2">
                  {nextConcept.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Progress Cards */}
      <div className="grid gap-6 mt-8">
        {sections.map((section) => (
          <div key={section.id} className="space-y-4">
            <h3 className="text-lg font-semibold">{section.title}</h3>
            {section.description && (
              <p className="text-muted-foreground">{section.description}</p>
            )}
            <div className="grid gap-4">
              {section.concepts.map((concept) => (
                <div
                  key={concept.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    {concept.imageUrl && (
                      <Image
                        src={concept.imageUrl}
                        alt={concept.title}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium">{concept.title}</h3>
                      {concept.description && (
                        <p className="text-sm text-muted-foreground">
                          {concept.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ConceptCompletionStatus
                      conceptId={concept.id}
                      isCompleted={concept.completed}
                      onComplete={async (conceptId) => {
                        await onCompleteAction(conceptId, courseId)
                      }}
                    />
                    {!concept.completed && (
                      <Link
                        href={`/dashboard/my-courses/${courseId}/concepts/${concept.id}`}
                      >
                        <Button variant="default" size="sm" className="gap-2">
                          Learn Concept
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
