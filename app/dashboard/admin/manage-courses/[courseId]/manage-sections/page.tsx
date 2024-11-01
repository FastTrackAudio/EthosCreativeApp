"use client"

import React, { useState } from "react"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { ConceptCard, KanbanSection } from "@/types/kanban"
import { Button } from "@/components/ui/button"
import { Type, ImageOff } from "lucide-react"

export default function ManageSectionsPage({
  params,
}: {
  params: { courseId: string }
}) {
  const queryClient = useQueryClient()
  const [hideDescriptions, setHideDescriptions] = useState(false)
  const [hideImages, setHideImages] = useState(false)

  // Fetch course details
  const { data: course } = useQuery({
    queryKey: ["course", params.courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/${params.courseId}`)
      return response.data
    },
  })

  // Fetch sections and concepts
  const { data: sections, isLoading: sectionsLoading } = useQuery<
    KanbanSection[]
  >({
    queryKey: ["sections", params.courseId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/courses/${params.courseId}/sections`
      )
      return response.data
    },
  })

  const { data: concepts, isLoading: conceptsLoading } = useQuery<
    ConceptCard[]
  >({
    queryKey: ["concepts", params.courseId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/courses/${params.courseId}/concepts`
      )
      return response.data
    },
  })

  // Mutations for sections
  const createSection = useMutation({
    mutationFn: async (data: { title: string; order: number }) => {
      const response = await axios.post(
        `/api/courses/${params.courseId}/sections`,
        {
          ...data,
          courseId: params.courseId,
        }
      )
      return response.data
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: ["sections", params.courseId],
      })

      const previousSections = queryClient.getQueryData<KanbanSection[]>([
        "sections",
        params.courseId,
      ])

      // Create an optimistic section
      const optimisticSection: KanbanSection = {
        id: `temp-${Date.now()}`,
        title: newData.title,
        description: null,
        order: newData.order,
        courseId: params.courseId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (previousSections) {
        queryClient.setQueryData<KanbanSection[]>(
          ["sections", params.courseId],
          [...previousSections, optimisticSection]
        )
      }

      return { previousSections }
    },
    onError: (err, newData, context) => {
      if (context?.previousSections) {
        queryClient.setQueryData(
          ["sections", params.courseId],
          context.previousSections
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["sections", params.courseId],
      })
    },
  })

  const updateSection = useMutation({
    mutationFn: async (data: Partial<KanbanSection> & { id: string }) => {
      const response = await axios.patch(
        `/api/courses/${params.courseId}/sections/${data.id}`,
        data
      )
      return response.data
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: ["sections", params.courseId],
      })

      const previousSections = queryClient.getQueryData<KanbanSection[]>([
        "sections",
        params.courseId,
      ])

      if (previousSections) {
        queryClient.setQueryData<KanbanSection[]>(
          ["sections", params.courseId],
          previousSections.map((section) =>
            section.id === newData.id ? { ...section, ...newData } : section
          )
        )
      }

      return { previousSections }
    },
    onError: (err, newData, context) => {
      if (context?.previousSections) {
        queryClient.setQueryData(
          ["sections", params.courseId],
          context.previousSections
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["sections", params.courseId],
      })
    },
  })

  const deleteSection = useMutation({
    mutationFn: async (sectionId: string) => {
      await axios.delete(
        `/api/courses/${params.courseId}/sections/${sectionId}`
      )
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({
        queryKey: ["sections", params.courseId],
      })

      const previousSections = queryClient.getQueryData<KanbanSection[]>([
        "sections",
        params.courseId,
      ])

      if (previousSections) {
        // Remove the section
        queryClient.setQueryData<KanbanSection[]>(
          ["sections", params.courseId],
          previousSections.filter((section) => section.id !== deletedId)
        )

        // Also remove all concepts in this section
        const previousConcepts = queryClient.getQueryData<ConceptCard[]>([
          "concepts",
          params.courseId,
        ])

        if (previousConcepts) {
          queryClient.setQueryData<ConceptCard[]>(
            ["concepts", params.courseId],
            previousConcepts.filter(
              (concept) => concept.sectionId !== deletedId
            )
          )
        }
      }

      return { previousSections }
    },
    onError: (err, deletedId, context) => {
      if (context?.previousSections) {
        queryClient.setQueryData(
          ["sections", params.courseId],
          context.previousSections
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["sections", params.courseId],
      })
      queryClient.invalidateQueries({
        queryKey: ["concepts", params.courseId],
      })
    },
  })

  // Mutations for concepts with optimistic updates
  const updateConcept = useMutation({
    mutationFn: async (data: Partial<ConceptCard> & { id: string }) => {
      if (!data.id) {
        throw new Error("Concept ID is required for updates")
      }
      const response = await axios.patch(
        `/api/courses/${params.courseId}/concepts/${data.id}`,
        data
      )
      return response.data
    },
    onMutate: async (newData) => {
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
          // Handle moving between sections and reordering
          const movingConcept = updatedConcepts.find((c) => c.id === newData.id)
          if (movingConcept) {
            // Remove from old position
            updatedConcepts = updatedConcepts.filter((c) => c.id !== newData.id)

            // Update the concept
            const updatedConcept = { ...movingConcept, ...newData }

            // Insert at new position
            updatedConcepts.splice(newData.order, 0, updatedConcept)

            // Update orders
            updatedConcepts = updatedConcepts.map((concept, index) => ({
              ...concept,
              order: index,
            }))
          }
        } else {
          // Handle simple updates
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

  const deleteConcept = useMutation({
    mutationFn: async (conceptId: string) => {
      await axios.delete(
        `/api/courses/${params.courseId}/concepts/${conceptId}`
      )
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({
        queryKey: ["concepts", params.courseId],
      })

      const previousConcepts = queryClient.getQueryData<ConceptCard[]>([
        "concepts",
        params.courseId,
      ])

      if (previousConcepts) {
        queryClient.setQueryData<ConceptCard[]>(
          ["concepts", params.courseId],
          (old) => old?.filter((concept) => concept.id !== deletedId)
        )
      }

      return { previousConcepts }
    },
    onError: (err, deletedId, context) => {
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

  // Add createConcept mutation
  const createConcept = useMutation({
    mutationFn: async (data: Partial<ConceptCard> & { sectionId: string }) => {
      // Get the current concepts to determine the order
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
    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: ["concepts", params.courseId],
      })

      const previousConcepts = queryClient.getQueryData<ConceptCard[]>([
        "concepts",
        params.courseId,
      ])

      // Create an optimistic concept
      const optimisticConcept: ConceptCard = {
        id: `temp-${Date.now()}`,
        title: newData.title!,
        description: newData.description ?? null,
        imageUrl: newData.imageUrl ?? null,
        sectionId: newData.sectionId,
        order: newData.order ?? 0,
        content: "{}",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        videoUrl: null,
        quizId: null,
      }

      if (previousConcepts) {
        queryClient.setQueryData<ConceptCard[]>(
          ["concepts", params.courseId],
          [...previousConcepts, optimisticConcept]
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
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Link
              href={`/dashboard/admin/manage-courses/${params.courseId}/edit`}
            ></Link>
          </div>
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
                conceptMaxWidth="max-w-[400px]"
                showConceptEditButtons={true}
                showCardDescription={!hideDescriptions}
                showCardImage={!hideImages}
                onCreateSection={(data) => createSection.mutate(data)}
                onUpdateSection={(data) => updateSection.mutate(data)}
                onDeleteSection={(id) => deleteSection.mutate(id)}
                onCreateCard={(data) => createConcept.mutate(data)}
                onUpdateCard={(data) => updateConcept.mutate(data)}
                onDeleteCard={(id) => deleteConcept.mutate(id)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
