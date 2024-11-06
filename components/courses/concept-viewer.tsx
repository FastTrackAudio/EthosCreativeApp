"use client";

import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomVideoPlayer } from "@/features/video-player/VideoPlayer";
import { ConceptContent } from "@/components/courses/concept-content";
import { ConceptListItem } from "@/components/courses/concept-list-item";
import { ConceptCompleteButton } from "@/components/courses/concept-complete-button";
import { toast } from "sonner";
import { useMemo } from "react";

interface ConceptViewerProps {
  courseId: string;
  conceptId: string;
}

export function ConceptViewer({ courseId, conceptId }: ConceptViewerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch curriculum instead of all concepts
  const { data: curriculum } = useQuery({
    queryKey: ["user-curriculum", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/${courseId}/curriculum`);
      return response.data;
    },
  });

  // Transform curriculum data for the sidebar
  const orderedConcepts = useMemo(() => {
    if (!curriculum) return [];

    return curriculum
      .sort((a: any, b: any) => {
        if (a.weekId !== b.weekId) {
          return parseInt(a.weekId) - parseInt(b.weekId);
        }
        return a.order - b.order;
      })
      .map((entry: any) => ({
        id: entry.concept.id,
        title: entry.concept.title,
        shortTitle: entry.concept.shortTitle,
        description: entry.concept.description,
        shortDescription: entry.concept.shortDescription,
        thumbnailUrl: entry.concept.imageUrl,
        sectionTitle: `Week ${entry.weekId}`,
        isCompleted: entry.isCompleted,
      }));
  }, [curriculum]);

  // Fetch course data
  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/${courseId}`);
      return response.data;
    },
  });

  // Fetch sections for badges
  const { data: sections } = useQuery({
    queryKey: ["sections", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/${courseId}/sections`);
      return response.data;
    },
  });

  // Fetch current concept
  const { data: currentConcept } = useQuery({
    queryKey: ["concept", conceptId],
    queryFn: async () => {
      const response = await axios.get(`/api/concepts/${conceptId}`);
      const data = response.data;
      if (typeof data.content === "string") {
        data.content = JSON.parse(data.content);
      }
      return data;
    },
  });

  // Parse and find the first video block
  const getFirstVideoBlock = (concept: any) => {
    if (!concept?.content) return null;
    
    let content;
    try {
      content = typeof concept.content === 'string' 
        ? JSON.parse(concept.content) 
        : concept.content;
      
      // Find first video block and remove it from content
      const videoBlockIndex = content.blocks?.findIndex(
        (block: any) => block.type === "video" && block.content?.url
      );
      
      if (videoBlockIndex === -1) return null;
      
      // Get the video block but don't modify the original content
      const videoBlock = content.blocks[videoBlockIndex];
      return videoBlock;
    } catch (error) {
      console.error("Error parsing concept content:", error);
      return null;
    }
  };

  const firstVideoBlock = currentConcept ? getFirstVideoBlock(currentConcept) : null;
  console.log("First video block:", firstVideoBlock); // Debug log

  // Function to find next concept
  const findNextConcept = () => {
    if (!orderedConcepts) return null;
    const currentIndex = orderedConcepts.findIndex(c => c.id === conceptId);
    if (currentIndex === -1 || currentIndex === orderedConcepts.length - 1) return null;
    return orderedConcepts[currentIndex + 1];
  };

  const nextConcept = findNextConcept();

  const handleComplete = (isCompleting: boolean) => {
    // Only navigate if we're marking as complete
    if (isCompleting && nextConcept) {
      router.push(`/dashboard/my-courses/${courseId}/concepts/${nextConcept.id}`);
    }
    // Otherwise just stay on the current page
  };

  const handleToggleComplete = async (conceptId: string) => {
    try {
      const response = await axios.post(`/api/concepts/${conceptId}/toggle-complete`);
      if (response.data.completed) {
        toast("Concept marked as complete", {
          description: "Your progress has been updated",
        });
      } else {
        toast("Concept marked as incomplete", {
          description: "Your progress has been updated",
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["concepts", courseId],
      });
    } catch (error) {
      toast("Failed to update completion status", {
        description: "Please try again",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              {currentConcept?.title}
            </h1>
            <ConceptCompleteButton
              conceptId={conceptId}
              courseId={courseId}
              onComplete={handleComplete}
            />
          </div>

          {/* Video Player - Only show if there's a video block */}
          {firstVideoBlock?.content?.url && (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-8">
              <CustomVideoPlayer
                url={firstVideoBlock.content.url}
                thumbnailUrl={firstVideoBlock.content.thumbnailUrl}
              />
            </div>
          )}

          {/* Render ConceptContent without the first video */}
          <ConceptContent
            conceptId={conceptId}
            courseId={courseId}
            editorMode={false}
            skipFirstVideo={true}
          />

          {/* Bottom Complete Button */}
          <div className="flex justify-center pt-8 pb-4">
            <ConceptCompleteButton
              conceptId={conceptId}
              courseId={courseId}
              onComplete={handleComplete}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:border-l lg:pl-6">
          <h2 className="text-xl font-semibold mb-4">Course Content</h2>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-3 pr-4">
              {orderedConcepts?.map((concept: any, index: number) => (
                <Link
                  key={concept.id}
                  href={`/dashboard/my-courses/${courseId}/concepts/${concept.id}`}
                >
                  <ConceptListItem
                    title={concept.title}
                    shortTitle={concept.shortTitle}
                    description={concept.description}
                    shortDescription={concept.shortDescription}
                    thumbnailUrl={concept.thumbnailUrl}
                    sectionTitle={concept.sectionTitle}
                    isActive={concept.id === conceptId}
                    isCompleted={concept.isCompleted}
                    index={index}
                    onClick={() => {}}
                    onToggleComplete={() => handleToggleComplete(concept.id)}
                  />
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
