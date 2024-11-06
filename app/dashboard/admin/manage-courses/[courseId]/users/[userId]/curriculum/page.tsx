"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import { CurriculumWeeks } from "@/components/curriculum/curriculum-weeks"
import axios from "axios"
import { ConceptCard, KanbanSection, DragEndResult } from "@/types/kanban"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DragDropContext } from "@hello-pangea/dnd"
import { toast } from "react-toastify"
import { DropResult } from "@hello-pangea/dnd"

interface PageProps {
  params: {
    courseId: string
    userId: string
  }
}

interface CurriculumWeek {
  id: string
  title: string
  weekId: string
  concepts: ConceptCard[]
}

interface CurriculumData {
  weeks: CurriculumWeek[]
}

export default function ManageUserCurriculumPage({ params }: PageProps) {
  const queryClient = useQueryClient()
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null)

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

  const { data: curriculum, isLoading: curriculumLoading } =
    useQuery<CurriculumData>({
      queryKey: ["curriculum", params.courseId, params.userId],
      queryFn: async () => {
        const response = await axios.get(
          `/api/courses/${params.courseId}/users/${params.userId}/curriculum`
        )

        // Transform the data into the expected format
        const groupedByWeek = response.data.reduce(
          (acc: Record<string, CurriculumWeek>, item: any) => {
            if (!acc[item.weekId]) {
              acc[item.weekId] = {
                id: item.weekId,
                title: `Week ${item.weekId}`,
                weekId: item.weekId,
                concepts: [],
              }
            }
            acc[item.weekId].concepts.push({
              id: item.conceptId,
              title: item.concept.title,
              description: item.concept.description,
              sectionId: item.concept.sectionId,
              createdAt: item.concept.createdAt || new Date(),
              updatedAt: item.concept.updatedAt || new Date(),
              order: item.concept.order,
              courseId: item.concept.courseId,
            })
            return acc
          },
          {}
        )

        return {
          weeks: Object.values(groupedByWeek),
        }
      },
    })

  const addToCurriculumMutation = useMutation({
    mutationFn: async ({
      conceptId,
      weekId,
      order,
    }: {
      conceptId: string
      weekId: string
      order: number
    }) => {
      const response = await axios.post(
        `/api/courses/${params.courseId}/users/${params.userId}/curriculum`,
        { conceptId, weekId, order }
      )
      return response.data
    },
    onMutate: async ({ conceptId, weekId, order }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["curriculum", params.courseId, params.userId],
      })

      // Get current curriculum data
      const previousCurriculum = queryClient.getQueryData<CurriculumData>([
        "curriculum",
        params.courseId,
        params.userId,
      ])

      // Find the concept from the concepts query
      const concept = queryClient
        .getQueryData<ConceptCard[]>(["concepts", params.courseId])
        ?.find((c) => c.id === conceptId)

      if (concept) {
        // Optimistically update curriculum
        queryClient.setQueryData<CurriculumData>(
          ["curriculum", params.courseId, params.userId],
          (old) => {
            if (!old) return { weeks: [] }

            const newWeeks = [...old.weeks]
            const weekIndex = newWeeks.findIndex((w) => w.weekId === weekId)

            if (weekIndex === -1) {
              newWeeks.push({
                id: weekId,
                title: `Week ${weekId}`,
                weekId,
                concepts: [concept],
              })
            } else {
              newWeeks[weekIndex].concepts.splice(order, 0, concept)
            }

            return { weeks: newWeeks }
          }
        )
      }

      return { previousCurriculum }
    },
    onError: (err, variables, context) => {
      if (context?.previousCurriculum) {
        queryClient.setQueryData(
          ["curriculum", params.courseId, params.userId],
          context.previousCurriculum
        )
      }
      toast.error("Failed to add to curriculum")
    },
    onSuccess: () => {
      toast.success("Added to curriculum")
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["curriculum", params.courseId, params.userId],
      })
    },
  })

  const removeFromCurriculumMutation = useMutation({
    mutationFn: async (conceptId: string) => {
      await axios.delete(
        `/api/courses/${params.courseId}/users/${params.userId}/curriculum/${conceptId}`
      )
    },
    onMutate: async (conceptId) => {
      await queryClient.cancelQueries({
        queryKey: ["curriculum", params.courseId, params.userId],
      })

      const previousCurriculum = queryClient.getQueryData<CurriculumData>([
        "curriculum",
        params.courseId,
        params.userId,
      ])

      queryClient.setQueryData<CurriculumData>(
        ["curriculum", params.courseId, params.userId],
        (old) => {
          if (!old) return { weeks: [] }

          return {
            weeks: old.weeks.map((week) => ({
              ...week,
              concepts: week.concepts.filter((c) => c.id !== conceptId),
            })),
          }
        }
      )

      return { previousCurriculum }
    },
    onError: (err, conceptId, context) => {
      if (context?.previousCurriculum) {
        queryClient.setQueryData(
          ["curriculum", params.courseId, params.userId],
          context.previousCurriculum
        )
      }
      toast.error("Failed to remove from curriculum")
    },
    onSuccess: () => {
      toast.success("Removed from curriculum")
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["curriculum", params.courseId, params.userId],
      })
    },
  })

  const addWeekMutation = useMutation({
    mutationFn: async (weekId: string) => {
      console.log("Mutation: Adding week", weekId);
      return { weekId };
    },
    onMutate: async (weekId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["curriculum", params.courseId, params.userId],
      });

      // Get current curriculum data
      const previousCurriculum = queryClient.getQueryData<CurriculumData>([
        "curriculum",
        params.courseId,
        params.userId,
      ]);

      // Optimistically update curriculum
      queryClient.setQueryData<CurriculumData>(
        ["curriculum", params.courseId, params.userId],
        (old) => {
          if (!old) return { weeks: [] };
          return {
            weeks: [
              ...old.weeks,
              {
                id: weekId,
                weekId: weekId,
                title: `Week ${weekId}`,
                concepts: [],
              },
            ],
          };
        }
      );

      return { previousCurriculum };
    },
    onSuccess: () => {
      console.log("Week added successfully");
    },
  });

  const reorderConceptsMutation = useMutation({
    mutationFn: async ({
      weekId,
      concepts,
    }: {
      weekId: string
      concepts: ConceptCard[]
    }) => {
      await axios.patch(
        `/api/courses/${params.courseId}/users/${params.userId}/curriculum/weeks/${weekId}/reorder`,
        {
          concepts: concepts.map((concept, index) => ({
            conceptId: concept.id,
            order: index,
          })),
        }
      )
    },
    onMutate: async ({ weekId, concepts }) => {
      await queryClient.cancelQueries({
        queryKey: ["curriculum", params.courseId, params.userId],
      })

      const previousCurriculum = queryClient.getQueryData<CurriculumData>([
        "curriculum",
        params.courseId,
        params.userId,
      ])

      queryClient.setQueryData<CurriculumData>(
        ["curriculum", params.courseId, params.userId],
        (old) => {
          if (!old) return { weeks: [] }

          return {
            weeks: old.weeks.map((week) =>
              week.weekId === weekId ? { ...week, concepts } : week
            ),
          }
        }
      )

      return { previousCurriculum }
    },
    onError: (err, variables, context) => {
      if (context?.previousCurriculum) {
        queryClient.setQueryData(
          ["curriculum", params.courseId, params.userId],
          context.previousCurriculum
        )
      }
      toast.error("Failed to reorder concepts")
    },
    onSuccess: () => {
      toast.success("Reordered concepts")
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["curriculum", params.courseId, params.userId],
      })
    },
  })

  const handleAddToCurriculum = (conceptId: string) => {
    if (!selectedWeek) {
      toast.error("Please select a week first")
      return
    }

    const weekConcepts =
      curriculum?.weeks?.find(
        (week: CurriculumWeek) => week.weekId === selectedWeek
      )?.concepts || []

    addToCurriculumMutation.mutate({
      conceptId,
      weekId: selectedWeek,
      order: weekConcepts.length,
    })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId: conceptId } = result
    const sourceWeekId = source.droppableId.replace("week-", "")
    const destWeekId = destination.droppableId.replace("week-", "")

    // Get the source week's concepts
    const sourceWeek = curriculum?.weeks?.find(
      (week: CurriculumWeek) => week.weekId === sourceWeekId
    )
    if (!sourceWeek) return

    if (sourceWeekId === destWeekId) {
      // Reordering within the same week
      const newConcepts = Array.from(sourceWeek.concepts)
      const [removed] = newConcepts.splice(source.index, 1)
      newConcepts.splice(destination.index, 0, removed)

      reorderConceptsMutation.mutate({
        weekId: sourceWeekId,
        concepts: newConcepts,
      })
    } else {
      // Moving to a different week
      addToCurriculumMutation.mutate({
        conceptId,
        weekId: destWeekId,
        order: destination.index,
      })
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="p-4 h-[calc(100vh-4rem)]">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Link
              href={`/dashboard/admin/manage-courses/${params.courseId}/users`}
              className="flex items-center hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Course Users
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Manage User Curriculum</h1>
        </div>

        <div className="grid grid-cols-6 gap-4 h-[calc(100%-2rem)]">
          {/* Course Content (Left Side - 4 columns) */}
          <div className="col-span-4 bg-muted/50 rounded-lg overflow-hidden">
            <h2 className="text-lg font-semibold p-4">Course Content</h2>
            <KanbanBoard
              sections={sections ?? []}
              cards={concepts ?? []}
              curriculumWeeks={curriculum?.weeks ?? []}
              isLoading={sectionsLoading || conceptsLoading}
              sectionWidth="min-w-[200px]"
              showCardDescription={false}
              showCardImage={false}
              showConceptEditButtons={false}
              isCurriculumView={true}
              onAddToCurriculum={handleAddToCurriculum}
              onRemoveFromCurriculum={removeFromCurriculumMutation.mutate}
              onCreateSection={() => {}}
              onUpdateSection={() => {}}
              onDeleteSection={() => {}}
              onCreateCard={() => {}}
              onUpdateCard={() => {}}
              onDeleteCard={() => {}}
              editorMode={false}
              courseId={params.courseId}
            />
          </div>

          {/* Curriculum Weeks (Right Side - 2 columns) */}
          <div className="col-span-2 bg-muted/50 rounded-lg overflow-hidden">
            <h2 className="text-lg font-semibold p-4">Weekly Curriculum</h2>
            <div className="overflow-y-auto h-[calc(100%-4rem)]">
              <CurriculumWeeks
                weeks={curriculum?.weeks ?? []}
                isLoading={curriculumLoading}
                selectedWeek={selectedWeek}
                onSelectWeek={setSelectedWeek}
                onUpdateWeek={(weekId) => addWeekMutation.mutate(weekId)}
                onRemoveFromCurriculum={removeFromCurriculumMutation.mutate}
              />
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}
