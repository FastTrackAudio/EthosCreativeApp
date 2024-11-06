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
  onCompleteAction: (conceptId: string, courseId: string) => Promise<void>
}

interface CurriculumEntry {
  conceptId: string
  order: number
  weekId: string
  isCompleted: boolean
}

// Also update the type for organizedConcepts to include curriculumOrder and weekId
type ConceptWithCurriculum =
  EnrolledCourseViewProps["sections"][0]["concepts"][0] & {
    curriculumOrder: number
    weekId: string
  }

export function EnrolledCourseView({
  courseId,
  courseTitle,
  courseDescription,
  sections,
  nextConcept,
  onCompleteAction,
}: EnrolledCourseViewProps) {
  // Fetch user's curriculum
  const { data: curriculum, isLoading: curriculumLoading } = useQuery({
    queryKey: ["user-curriculum", courseId],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/courses/${courseId}/curriculum`);
        console.log("Curriculum response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching curriculum:", error);
        return [];
      }
    },
  });

  // Filter and organize concepts based on curriculum
  const organizedConcepts = useMemo(() => {
    if (!curriculum?.length) {
      console.log("No curriculum data");
      return [];
    }

    try {
      // The curriculum data already contains the concept information
      const orderedConcepts = curriculum.map(entry => ({
        id: entry.concept.id,
        title: entry.concept.title,
        description: entry.concept.description,
        shortTitle: entry.concept.shortTitle,
        shortDescription: entry.concept.shortDescription,
        imageUrl: entry.concept.imageUrl,
        sectionId: entry.concept.sectionId,
        sectionTitle: entry.concept.sectionTitle,
        weekNumber: entry.weekId,
        curriculumOrder: entry.order,
        isCompleted: entry.isCompleted
      }))
      .sort((a, b) => {
        if (a.weekNumber !== b.weekNumber) {
          return parseInt(a.weekNumber) - parseInt(b.weekNumber);
        }
        return a.curriculumOrder - b.curriculumOrder;
      });

      console.log("Organized concepts:", orderedConcepts);
      return orderedConcepts;
    } catch (error) {
      console.error("Error organizing concepts:", error);
      return [];
    }
  }, [curriculum]);

  // Find the next incomplete concept
  const nextIncompleteConcept = useMemo(() => {
    if (!organizedConcepts.length) return null;
    return organizedConcepts.find(concept => !concept.isCompleted) || null;
  }, [organizedConcepts]);

  if (curriculumLoading) {
    return <div>Loading curriculum...</div>;
  }

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
          {/* Next Concept Card or Caught Up Message */}
          <div className="mb-12">
            {nextIncompleteConcept ? (
              <NextConceptCard 
                concept={nextIncompleteConcept} 
                courseId={courseId} 
              />
            ) : (
              <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-semibold mb-2">
                  You're all caught up! 🎉
                </h3>
                <p className="text-muted-foreground">
                  Great job! You've completed all available concepts for now.
                </p>
              </div>
            )}
          </div>

          {/* Concept List - Only show organized concepts */}
          <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
            <ConceptList 
              concepts={organizedConcepts} 
              courseId={courseId} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
