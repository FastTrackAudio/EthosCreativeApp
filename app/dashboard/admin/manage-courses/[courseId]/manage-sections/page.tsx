"use client"

import React, { useState } from "react"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import Link from "next/link"
import { ArrowLeft, Type, ImageOff } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { ConceptCard, KanbanSection } from "@/types/kanban"
import { Button } from "@/components/ui/button"

type ConceptUpdateData = Partial<ConceptCard> & {
  id: string
  sectionId?: string
  order?: number
}

export default function ManageSectionsPage({
  params,
}: {
  params: { courseId: string }
}) {
  const queryClient = useQueryClient()
  const [hideDescriptions, setHideDescriptions] = useState(false)
  const [hideImages, setHideImages] = useState(false)

  // Fetch sections
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["sections", params.courseId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/courses/${params.courseId}/sections`
      )
      return response.data
    },
  })

  // Fetch concepts
  const { data: concepts, isLoading: conceptsLoading } = useQuery({
    queryKey: ["concepts", params.courseId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/courses/${params.courseId}/concepts`
      )
      return response.data
    },
  })

  // Create section mutation
  const createSection = useMutation({
    mutationFn: async (data: { title: string; order: number }) => {
      const response = await axios.post(
        `/api/courses/${params.courseId}/sections`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sections", params.courseId],
      })
    },
  })

  // Update section mutation
  const updateSection = useMutation({
    mutationFn: async (data: Partial<KanbanSection> & { id: string }) => {
      const response = await axios.patch(
        `/api/courses/${params.courseId}/sections/${data.id}`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sections", params.courseId],
      })
    },
  })

  // Delete section mutation
  const deleteSection = useMutation({
    mutationFn: async (sectionId: string) => {
      await axios.delete(
        `/api/courses/${params.courseId}/sections/${sectionId}`
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sections", params.courseId],
      })
      queryClient.invalidateQueries({
        queryKey: ["concepts", params.courseId],
      })
    },
  })

  // Update concept mutation
  const updateConcept = useMutation({
    mutationFn: async (data: ConceptUpdateData) => {
      const response = await axios.patch(
        `/api/courses/${params.courseId}/concepts/${data.id}`,
        data
      )
      return response.data
    },
    onMutate: async (newData: ConceptUpdateData) => {
      await queryClient.cancelQueries({
        queryKey: ["concepts", params.courseId],
      })

      const previousConcepts = queryClient.getQueryData<ConceptCard[]>([
        "concepts",
        params.courseId,
      ])

      if (previousConcepts) {
        let updatedConcepts = [...previousConcepts]

        if (newData.sectionId && newData.order !== undefined) {
          const movingConcept = updatedConcepts.find((c) => c.id === newData.id)
          if (movingConcept) {
            updatedConcepts = updatedConcepts.filter((c) => c.id !== newData.id)
            const updatedConcept = { ...movingConcept, ...newData }
            updatedConcepts.splice(newData.order, 0, updatedConcept)
            updatedConcepts = updatedConcepts.map((concept, index) => ({
              ...concept,
              order: index,
            }))
          }
        } else {
          updatedConcepts = updatedConcepts.map((concept) =>
            concept.id === newData.id ? { ...concept, ...newData } : concept
          )
        }

        queryClient.setQueryData<ConceptCard[]>(
          ["concepts", params.courseId],
          updatedConcepts
        )
      }

      return { previousConcepts }
    },
    onError: (err, newData, context) => {
      if (context?.previousConcepts) {
        queryClient.setQueryData(
          ["concepts", params.courseId],
          context.previousConcepts
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["concepts", params.courseId],
      })
    },
  })

  // Delete concept mutation
  const deleteConcept = useMutation({
    mutationFn: async (conceptId: string) => {
      await axios.delete(
        `/api/courses/${params.courseId}/concepts/${conceptId}`
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["concepts", params.courseId],
      })
    },
  })

  // Create concept mutation
  const createConcept = useMutation({
    mutationFn: async (data: Partial<ConceptCard> & { sectionId: string }) => {
      const currentConcepts = queryClient.getQueryData<ConceptCard[]>([
        "concepts",
        params.courseId,
      ])
      const sectionConcepts = currentConcepts?.filter(
        (c) => c.sectionId === data.sectionId
      )
      const order = sectionConcepts?.length ?? 0

      const response = await axios.post(
        `/api/courses/${params.courseId}/concepts`,
        {
          ...data,
          order,
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["concepts", params.courseId],
      })
    },
  })

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Link
            href="/dashboard/admin/manage-courses"
            className="flex items-center hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Link>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <div className="relative mb-4">
          <div>
            <h2 className="text-2xl font-bold">Course Sections</h2>
            <p className="text-muted-foreground">
              Organize your course sections and concepts
            </p>
          </div>

          <div className="absolute top-0 right-0 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHideDescriptions(!hideDescriptions)}
            >
              <Type className="h-4 w-4 mr-2" />
              {hideDescriptions ? "Show Descriptions" : "Hide Descriptions"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHideImages(!hideImages)}
            >
              <ImageOff className="h-4 w-4 mr-2" />
              {hideImages ? "Show Images" : "Hide Images"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <KanbanBoard
                sections={sections ?? []}
                cards={concepts ?? []}
                isLoading={sectionsLoading || conceptsLoading}
                sectionWidth="min-w-[250px]"
                showConceptEditButtons={true}
                showCardDescription={!hideDescriptions}
                showCardImage={!hideImages}
                editorMode={false}
                courseId={params.courseId}
                onCreateSection={(data) => createSection.mutate(data)}
                onUpdateSection={(data) => updateSection.mutate(data)}
                onDeleteSection={(id) => deleteSection.mutate(id)}
                onCreateCard={(data) => createConcept.mutate(data)}
                onUpdateCard={(data) => updateConcept.mutate(data)}
                onDeleteCard={(id) => deleteConcept.mutate(id)}
                cardUrlPattern="/dashboard/admin/manage-courses/:courseId/sections/:sectionId/concepts/:conceptId"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
