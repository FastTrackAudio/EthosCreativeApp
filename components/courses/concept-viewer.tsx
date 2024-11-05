"use client";

import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { CustomVideoPlayer } from "@/features/video-player/VideoPlayer";
import { ConceptContent } from "@/components/courses/concept-content";
import { ConceptListItem } from "@/components/courses/concept-list-item";

interface ConceptViewerProps {
  courseId: string;
  conceptId: string;
}

export function ConceptViewer({ courseId, conceptId }: ConceptViewerProps) {
  // Fetch course data
  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/${courseId}`);
      return response.data;
    },
  });

  // Fetch concepts for sidebar
  const { data: concepts } = useQuery({
    queryKey: ["concepts", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/${courseId}/concepts`);
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

  // Find the first video block in the content
  const firstVideoBlock = currentConcept?.content?.blocks?.find(
    (block: any) => block.type === "video"
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold">{course?.title}</h1>

          {firstVideoBlock && (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
              <CustomVideoPlayer
                url={firstVideoBlock.content.url}
                thumbnailUrl={firstVideoBlock.content.thumbnailUrl}
              />
            </div>
          )}

          {/* Render ConceptContent */}
          <ConceptContent
            conceptId={conceptId}
            courseId={courseId}
            editorMode={false}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:border-l lg:pl-6">
          <h2 className="text-xl font-semibold mb-4">Course Content</h2>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-3 pr-4">
              {concepts?.map((concept, index) => {
                const section = sections?.find(
                  (s) => s.id === concept.sectionId
                );

                return (
                  <Link
                    key={concept.id}
                    href={`/dashboard/my-courses/${courseId}/concepts/${concept.id}`}
                  >
                    <ConceptListItem
                      title={concept.title}
                      description={concept.description || undefined}
                      thumbnailUrl={concept.thumbnailUrl}
                      sectionTitle={section?.title || ""}
                      isActive={concept.id === conceptId}
                      index={index}
                      onClick={() => {}}
                    />
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
