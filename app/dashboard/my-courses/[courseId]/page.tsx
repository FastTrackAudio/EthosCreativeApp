"use client";

import { EnrolledCourseView } from "@/components/courses/enrolled-course-view";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: {
    courseId: string;
  };
}

export default function CoursePage({ params }: PageProps) {
  // Fetch course data
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", params.courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/${params.courseId}`);
      return response.data;
    },
  });

  // Fetch sections and concepts
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["sections", params.courseId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/courses/${params.courseId}/sections`
      );
      return response.data;
    },
  });

  // Fetch next concept
  const { data: nextConcept, isLoading: nextConceptLoading } = useQuery({
    queryKey: ["next-concept", params.courseId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/courses/${params.courseId}/next-concept`
      );
      return response.data;
    },
  });

  if (courseLoading || sectionsLoading || nextConceptLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-12 w-[300px] mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <EnrolledCourseView
      courseId={params.courseId}
      courseTitle={course?.title}
      courseDescription={course?.description}
      sections={sections ?? []}
      nextConcept={nextConcept}
      onCompleteAction={async (conceptId: string, courseId: string) => {
        await axios.post(`/api/concepts/${conceptId}/complete`);
      }}
    />
  );
}
