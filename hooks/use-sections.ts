"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { db } from "@/lib/mock-db"
import { Section } from "@/types/kanban"
import { toast } from "sonner"

export function useSections() {
  const queryClient = useQueryClient()

  const { data: sections, isLoading } = useQuery({
    queryKey: ["sections"],
    queryFn: async () => {
      const data = await db.section.findMany()
      return data.sort((a, b) => a.order - b.order)
    },
  })

  const createSection = useMutation({
    mutationFn: async (newSection: Partial<Section>) => {
      return await db.section.create({ data: newSection })
    },
    onMutate: async (newSection) => {
      await queryClient.cancelQueries({ queryKey: ["sections"] })

      const previousSections = queryClient.getQueryData<Section[]>(["sections"])

      if (previousSections) {
        queryClient.setQueryData<Section[]>(
          ["sections"],
          [
            ...previousSections,
            {
              id: `temp-${Date.now()}`,
              title: newSection.title!,
              order: newSection.order!,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]
        )
      }

      return { previousSections }
    },
    onError: (err, newSection, context) => {
      if (context?.previousSections) {
        queryClient.setQueryData(["sections"], context.previousSections)
      }
      toast.error("Failed to create section")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] })
      toast.success("Section created successfully")
    },
  })

  const updateSection = useMutation({
    mutationFn: async (section: Partial<Section>) => {
      return await db.section.update({
        where: { id: section.id! },
        data: section,
      })
    },
    onMutate: async (updatedSection) => {
      await queryClient.cancelQueries({ queryKey: ["sections"] })

      const previousSections = queryClient.getQueryData<Section[]>(["sections"])

      if (previousSections) {
        queryClient.setQueryData<Section[]>(
          ["sections"],
          previousSections.map((section) =>
            section.id === updatedSection.id
              ? { ...section, ...updatedSection }
              : section
          )
        )
      }

      return { previousSections }
    },
    onError: (err, updatedSection, context) => {
      if (context?.previousSections) {
        queryClient.setQueryData(["sections"], context.previousSections)
      }
      toast.error("Failed to update section")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] })
      toast.success("Section updated successfully")
    },
  })

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      return await db.section.delete({
        where: { id },
      })
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["sections"] })

      const previousSections = queryClient.getQueryData<Section[]>(["sections"])

      if (previousSections) {
        queryClient.setQueryData<Section[]>(
          ["sections"],
          previousSections.filter((section) => section.id !== deletedId)
        )
      }

      return { previousSections }
    },
    onError: (err, deletedId, context) => {
      if (context?.previousSections) {
        queryClient.setQueryData(["sections"], context.previousSections)
      }
      toast.error("Failed to delete section")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] })
      queryClient.invalidateQueries({ queryKey: ["cards"] })
      toast.success("Section deleted successfully")
    },
  })

  return {
    sections,
    isLoading,
    createSection,
    updateSection,
    deleteSection,
  }
}
