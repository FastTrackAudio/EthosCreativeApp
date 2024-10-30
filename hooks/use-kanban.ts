import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Section, Concept } from "@prisma/client"

export function useKanban(courseId: string) {
  const queryClient = useQueryClient()

  // Fetch sections and concepts
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["sections", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/${courseId}/sections`)
      return response.data
    },
  })

  const { data: concepts, isLoading: conceptsLoading } = useQuery({
    queryKey: ["concepts", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/${courseId}/concepts`)
      return response.data
    },
  })

  // Create section
  const createSection = useMutation({
    mutationFn: async (data: { title: string; order: number }) => {
      const response = await axios.post(`/api/courses/${courseId}/sections`, {
        ...data,
        courseId,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sections", courseId])
    },
  })

  // Update section
  const updateSection = useMutation({
    mutationFn: async (data: Partial<Section>) => {
      const response = await axios.patch(
        `/api/courses/${courseId}/sections/${data.id}`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sections", courseId])
    },
  })

  // Delete section
  const deleteSection = useMutation({
    mutationFn: async (sectionId: string) => {
      await axios.delete(`/api/courses/${courseId}/sections/${sectionId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sections", courseId])
    },
  })

  // Create concept
  const createConcept = useMutation({
    mutationFn: async (data: {
      title: string
      description?: string
      sectionId: string
      order: number
    }) => {
      const response = await axios.post(
        `/api/courses/${courseId}/sections/${data.sectionId}/concepts`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["concepts", courseId])
    },
  })

  // Update concept
  const updateConcept = useMutation({
    mutationFn: async (data: Partial<Concept>) => {
      const response = await axios.patch(
        `/api/courses/${courseId}/concepts/${data.id}`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["concepts", courseId])
    },
  })

  // Delete concept
  const deleteConcept = useMutation({
    mutationFn: async (conceptId: string) => {
      await axios.delete(`/api/courses/${courseId}/concepts/${conceptId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["concepts", courseId])
    },
  })

  return {
    sections,
    concepts,
    isLoading: sectionsLoading || conceptsLoading,
    createSection,
    updateSection,
    deleteSection,
    createConcept,
    updateConcept,
    deleteConcept,
  }
}
