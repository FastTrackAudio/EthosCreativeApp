"use client"

import { NextConceptCard } from "./next-concept-card"
import { ConceptList } from "./concept-list"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useMemo } from "react"

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
      description: string | null
      imageUrl: string | null
      completed: boolean
      order: number
      sectionTitle: string
    }[]
  }[]
  nextConcept?: {
    id: string
    title: string
    description: string | null
    imageUrl: string | null
    sectionId: string
    sectionTitle: string
  } | null
}

interface CurriculumEntry {
  conceptId: string
  order: number
  weekId: string
  isCompleted: boolean
}

export function EnrolledCourseView({
  courseId,
  courseTitle,
  courseDescription,
  sections,
  nextConcept,
}: EnrolledCourseViewProps) {
  // Fetch curriculum order
  const { data: curriculum } = useQuery<CurriculumEntry[]>({
    queryKey: ["curriculum", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/${courseId}/curriculum`)
      return response.data
    },
  })

  // Flatten all concepts from sections
  const allConcepts = sections.flatMap((section) =>
    section.concepts.map((concept) => ({
      ...concept,
      sectionTitle: section.title,
    }))
  )

  // Group concepts by week and sort within each week
  const organizedConcepts = useMemo(() => {
    if (!curriculum) return allConcepts

    // Create a map for quick concept lookup
    const conceptMap = new Map(
      allConcepts.map((concept) => [concept.id, concept])
    )

    // Group by week
    const weekGroups = curriculum.reduce((acc, curr) => {
      const concept = conceptMap.get(curr.conceptId)
      if (!concept) return acc

      const week = curr.weekId
      if (!acc[week]) acc[week] = []

      acc[week].push({
        ...concept,
        curriculumOrder: curr.order,
        weekId: curr.weekId,
      })
      return acc
    }, {} as Record<string, typeof allConcepts>)

    // Sort within each week and flatten
    return Object.entries(weekGroups)
      .sort(([weekA], [weekB]) => weekA.localeCompare(weekB))
      .flatMap(([_, concepts]) =>
        concepts.sort((a, b) => a.curriculumOrder - b.curriculumOrder)
      )
  }, [curriculum, allConcepts])

  // Add concepts that aren't in curriculum at the end
  const sortedConcepts = useMemo(() => {
    if (!curriculum) return allConcepts

    const curriculumConceptIds = new Set(curriculum.map((c) => c.conceptId))
    const nonCurriculumConcepts = allConcepts.filter(
      (concept) => !curriculumConceptIds.has(concept.id)
    )

    return [...organizedConcepts, ...nonCurriculumConcepts]
  }, [curriculum, organizedConcepts, allConcepts])

  return (
    <div className="min-h-screen bg-background">
      {/* Course Header */}
      <div className="border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-8">
        <div className="container max-w-5xl">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            {courseTitle}
          </h1>
          {courseDescription && (
            <p className="text-muted-foreground">{courseDescription}</p>
          )}
        </div>
      </div>

      {/* Course Content */}
      <div className="container max-w-5xl py-8">
        <div className="space-y-8">
          {/* Next Concept Card */}
          {nextConcept && (
            <div className="mb-12">
              <NextConceptCard concept={nextConcept} courseId={courseId} />
            </div>
          )}

          {/* Concept List */}
          <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
            <ConceptList concepts={sortedConcepts} courseId={courseId} />
          </div>
        </div>
      </div>
    </div>
  )
}
