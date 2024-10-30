"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ExternalLink,
  MoreVertical,
  Trash,
  Edit,
  PlusCircle,
} from "lucide-react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddSectionModal } from "../../features/courses/sections/AddSectionModal"
import { AddConceptModal } from "../../features/courses/concepts/AddConceptModal"
import { EditSectionForm } from "../../features/courses/sections/EditSectionForm"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { KanbanCard } from "./KanbanCard"
import { useRouter } from "next/navigation"

type Section = {
  id: string
  title: string
  description: string | null
}

type Concept = {
  id: string
  title: string
  content: string
  imageUrl: string | null
  sectionId: string
}

interface KanbanBoardProps {
  courseId: string
  isAdminView?: boolean
}

export function KanbanBoard({
  courseId,
  isAdminView = false,
}: KanbanBoardProps) {
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false)
  const [addingConceptToSection, setAddingConceptToSection] = useState<
    string | null
  >(null)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(
    null
  )
  const [deletingConceptId, setDeletingConceptId] = useState<string | null>(
    null
  )
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["sections", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/sections`)
      if (!response.ok) throw new Error("Failed to fetch sections")
      return response.json()
    },
  })

  const { data: concepts, isLoading: conceptsLoading } = useQuery({
    queryKey: ["concepts", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/concepts`)
      if (!response.ok) throw new Error("Failed to fetch concepts")
      return response.json()
    },
  })

  const addSectionMutation = useMutation({
    mutationFn: async (newSection: { title: string; description?: string }) => {
      const response = await fetch(`/api/courses/${courseId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSection),
      })
      if (!response.ok) throw new Error("Failed to add section")
      return response.json()
    },
    onMutate: async (newSection) => {
      setIsAddingSectionOpen(false)

      await queryClient.cancelQueries({ queryKey: ["sections", courseId] })
      const previousSections = queryClient.getQueryData(["sections", courseId])
      queryClient.setQueryData(["sections", courseId], (old: any = []) => [
        ...old,
        { id: "temp-" + Date.now(), ...newSection },
      ])
      return { previousSections }
    },
    onError: (err, newSection, context) => {
      setIsAddingSectionOpen(true)
      queryClient.setQueryData(
        ["sections", courseId],
        context?.previousSections
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] })
    },
  })

  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      const response = await fetch(
        `/api/courses/${courseId}/sections/${sectionId}`,
        {
          method: "DELETE",
        }
      )
      if (!response.ok) throw new Error("Failed to delete section")
    },
    onMutate: async (deletedSectionId) => {
      await queryClient.cancelQueries({ queryKey: ["sections", courseId] })
      const previousSections = queryClient.getQueryData<Section[]>([
        "sections",
        courseId,
      ])

      queryClient.setQueryData<Section[]>(["sections", courseId], (old = []) =>
        old.filter((section) => section.id !== deletedSectionId)
      )

      return { previousSections }
    },
    onError: (err, deletedSectionId, context) => {
      queryClient.setQueryData(
        ["sections", courseId],
        context?.previousSections
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] })
      queryClient.invalidateQueries({ queryKey: ["concepts", courseId] })
    },
  })

  const addConceptMutation = useMutation({
    mutationFn: async ({
      sectionId,
      newConcept,
    }: {
      sectionId: string
      newConcept: { title: string; content: string }
    }) => {
      const response = await fetch(
        `/api/courses/${courseId}/sections/${sectionId}/concepts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newConcept),
        }
      )
      if (!response.ok) throw new Error("Failed to add concept")
      return response.json()
    },
    onMutate: async ({ sectionId, newConcept }) => {
      setAddingConceptToSection(null)

      await queryClient.cancelQueries({ queryKey: ["concepts", courseId] })
      const previousConcepts = queryClient.getQueryData<Concept[]>([
        "concepts",
        courseId,
      ])

      queryClient.setQueryData<Concept[]>(
        ["concepts", courseId],
        (old = []) => [
          ...old,
          {
            id: "temp-" + Date.now(),
            ...newConcept,
            sectionId,
            imageUrl: null,
          },
        ]
      )

      return { previousConcepts }
    },
    onError: (err, variables, context) => {
      setAddingConceptToSection(variables.sectionId)
      queryClient.setQueryData(
        ["concepts", courseId],
        context?.previousConcepts
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["concepts", courseId] })
    },
  })

  const deleteConceptMutation = useMutation({
    mutationFn: async (conceptId: string) => {
      const response = await fetch(
        `/api/courses/${courseId}/concepts/${conceptId}`,
        {
          method: "DELETE",
        }
      )
      if (!response.ok) throw new Error("Failed to delete concept")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concepts", courseId] })
    },
  })

  const updateSectionMutation = useMutation({
    mutationFn: async (updatedSection: Section) => {
      const response = await fetch(
        `/api/courses/${courseId}/sections/${updatedSection.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSection),
        }
      )
      if (!response.ok) throw new Error("Failed to update section")
      return response.json()
    },
    onMutate: async (updatedSection) => {
      setEditingSection(null)

      await queryClient.cancelQueries({ queryKey: ["sections", courseId] })
      const previousSections = queryClient.getQueryData<Section[]>([
        "sections",
        courseId,
      ])

      queryClient.setQueryData<Section[]>(["sections", courseId], (old = []) =>
        old.map((section) =>
          section.id === updatedSection.id ? updatedSection : section
        )
      )

      return { previousSections }
    },
    onError: (err, updatedSection, context) => {
      setEditingSection(updatedSection)
      queryClient.setQueryData(
        ["sections", courseId],
        context?.previousSections
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] })
    },
  })

  const deleteCoursesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete course")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      router.push("/dashboard/my-courses") // Redirect to courses list
    },
  })

  if (sectionsLoading || conceptsLoading) return <div>Loading...</div>

  if (!sections || sections.length === 0) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Course Board</h1>
        <p className="mb-4">No sections found for this course.</p>
        <Button onClick={() => setIsAddingSectionOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Section
        </Button>
        {isAddingSectionOpen && (
          <AddSectionModal
            onClose={() => setIsAddingSectionOpen(false)}
            onAdd={(newSection) => addSectionMutation.mutate(newSection)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {sections?.map((section) => (
          <div key={section.id} className="flex-shrink-0 w-72">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{section.title}</h3>
              {isAdminView && (
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSection(section)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingSectionId(section.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="bg-background p-2 rounded-lg min-h-[200px]">
              {concepts
                ?.filter((concept) => concept.sectionId === section.id)
                .map((concept) => (
                  <KanbanCard
                    key={concept.id}
                    concept={concept}
                    courseId={courseId}
                    sectionId={section.id}
                    isAdminView={isAdminView}
                  />
                ))}
            </div>
            {isAdminView && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => setAddingConceptToSection(section.id)}
              >
                Add Concept
              </Button>
            )}
          </div>
        ))}
        {isAdminView && (
          <div className="flex-shrink-0 w-72">
            <Button
              variant="outline"
              className="w-full h-full min-h-[200px]"
              onClick={() => setIsAddingSectionOpen(true)}
            >
              Add Section
            </Button>
          </div>
        )}
      </div>
      <AlertDialog
        open={deletingSectionId === "course"}
        onOpenChange={() => setDeletingSectionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entire course?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              course and all its sections and concepts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteCoursesMutation.mutate()
                setDeletingSectionId(null)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!deletingSectionId}
        onOpenChange={() => setDeletingSectionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              section and all its concepts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingSectionId) {
                  deleteSectionMutation.mutate(deletingSectionId)
                  setDeletingSectionId(null)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!deletingConceptId}
        onOpenChange={() => setDeletingConceptId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this concept?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              concept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingConceptId) {
                  deleteConceptMutation.mutate(deletingConceptId)
                  setDeletingConceptId(null)
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {isAddingSectionOpen && (
        <AddSectionModal
          onClose={() => setIsAddingSectionOpen(false)}
          onAdd={(newSection) => addSectionMutation.mutate(newSection)}
        />
      )}
      {addingConceptToSection && (
        <AddConceptModal
          onClose={() => setAddingConceptToSection(null)}
          onAdd={(newConcept) =>
            addConceptMutation.mutate({
              sectionId: addingConceptToSection,
              newConcept,
            })
          }
        />
      )}
      {editingSection && (
        <EditSectionForm
          section={editingSection}
          courseId={courseId}
          onClose={() => setEditingSection(null)}
          onSubmit={(updatedSection) => {
            // Implement update section mutation
            updateSectionMutation.mutate(updatedSection)
            setEditingSection(null)
          }}
        />
      )}
    </div>
  )
}
