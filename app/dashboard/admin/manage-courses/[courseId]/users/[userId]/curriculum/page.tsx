"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CurriculumWeeks } from "@/components/curriculum/curriculum-weeks";
import axios from "axios";
import { ConceptCard, KanbanSection, DragEndResult } from "@/types/kanban";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DragDropContext } from "@hello-pangea/dnd";

interface PageProps {
  params: {
    courseId: string;
    userId: string;
  };
}

export default function ManageUserCurriculumPage({ params }: PageProps) {
  const queryClient = useQueryClient();
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  // Fetch sections and concepts
  const { data: sections, isLoading: sectionsLoading } = useQuery<
    KanbanSection[]
  >({
    queryKey: ["sections", params.courseId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/courses/${params.courseId}/sections`
      );
      return response.data;
    },
  });

  const { data: concepts, isLoading: conceptsLoading } = useQuery<
    ConceptCard[]
  >({
    queryKey: ["concepts", params.courseId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/courses/${params.courseId}/concepts`
      );
      return response.data;
    },
  });

  const { data: curriculum, isLoading: curriculumLoading } = useQuery({
    queryKey: ["curriculum", params.courseId, params.userId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/courses/${params.courseId}/users/${params.userId}/curriculum`
      );
      return response.data;
    },
  });

  const addToCurriculumMutation = useMutation({
    mutationFn: async ({
      conceptId,
      weekId,
      order,
    }: {
      conceptId: string;
      weekId: string;
      order: number;
    }) => {
      await axios.post(
        `/api/courses/${params.courseId}/users/${params.userId}/curriculum`,
        {
          conceptId,
          weekId,
          order,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["curriculum", params.courseId, params.userId],
      });
    },
  });

  const removeFromCurriculumMutation = useMutation({
    mutationFn: async (conceptId: string) => {
      await axios.delete(
        `/api/courses/${params.courseId}/users/${params.userId}/curriculum/${conceptId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["curriculum", params.courseId, params.userId],
      });
    },
  });

  const handleAddToCurriculum = (conceptId: string) => {
    if (!selectedWeek) return;

    const weekConcepts =
      curriculum?.weeks.filter(
        (item: { weekId: string }) => item.weekId === selectedWeek
      ) ?? [];

    addToCurriculumMutation.mutate({
      conceptId,
      weekId: selectedWeek,
      order: weekConcepts.length,
    });
  };

  const handleDragEnd = (result: DragEndResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId: conceptId } = result;

    // Only handle reordering within the curriculum weeks
    if (
      source.droppableId.startsWith("week-") &&
      destination.droppableId.startsWith("week-")
    ) {
      addToCurriculumMutation.mutate({
        conceptId,
        weekId: destination.droppableId,
        order: destination.index,
      });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="p-4">
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

        <div className="grid grid-cols-6 gap-4">
          {/* Course Content (Left Side - 4 columns) */}
          <div className="col-span-4 bg-muted/50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Course Content</h2>
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
              // Disable all other mutation functions
              onCreateSection={() => {}}
              onUpdateSection={() => {}}
              onDeleteSection={() => {}}
              onCreateCard={() => {}}
              onUpdateCard={() => {}}
              onDeleteCard={() => {}}
              onRemoveFromCurriculum={removeFromCurriculumMutation.mutate}
            />
          </div>

          {/* Curriculum Weeks (Right Side - 2 columns) */}
          <div className="col-span-2 bg-muted/50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Weekly Curriculum</h2>
            <CurriculumWeeks
              weeks={curriculum?.weeks ?? []}
              isLoading={curriculumLoading}
              selectedWeek={selectedWeek}
              onSelectWeek={setSelectedWeek}
              onUpdateWeek={() => {}}
            />
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
