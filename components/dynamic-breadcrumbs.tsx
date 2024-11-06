"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface BreadcrumbSegment {
  name: string;
  href: string;
}

export default function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbSegment[]>([]);

  // Extract IDs from the pathname
  const courseId = pathname.match(/my-courses\/([^\/]+)/)?.[1];
  const sectionId = pathname.match(/sections\/([^\/]+)/)?.[1];
  const conceptId = pathname.match(/concepts\/([^\/]+)/)?.[1];

  // Fetch course data if courseId exists
  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const response = await axios.get(`/api/courses/${courseId}`);
      return response.data;
    },
    enabled: !!courseId,
  });

  // Fetch section data if sectionId exists
  const { data: section } = useQuery({
    queryKey: ["section", sectionId],
    queryFn: async () => {
      if (!sectionId) return null;
      const response = await axios.get(`/api/sections/${sectionId}`);
      return response.data;
    },
    enabled: !!sectionId,
  });

  // Fetch concept data if conceptId exists
  const { data: concept } = useQuery({
    queryKey: ["concept", conceptId],
    queryFn: async () => {
      if (!conceptId) return null;
      const response = await axios.get(`/api/concepts/${conceptId}`);
      return response.data;
    },
    enabled: !!conceptId,
  });

  useEffect(() => {
    async function generateBreadcrumbs() {
      const pathSegments = pathname.split("/").filter((segment) => segment);
      const newBreadcrumbs: BreadcrumbSegment[] = [
        { name: "Dashboard", href: "/dashboard" },
      ];

      // Build the breadcrumb path based on the current route
      if (courseId) {
        // Add My Courses
        newBreadcrumbs.push({
          name: "My Courses",
          href: "/dashboard/my-courses",
        });

        // Add Course
        if (course) {
          newBreadcrumbs.push({
            name: course.title,
            href: `/dashboard/my-courses/${courseId}`,
          });
        }

        // Add Section if it exists
        if (sectionId && section) {
          newBreadcrumbs.push({
            name: section.title,
            href: `/dashboard/my-courses/${courseId}/sections/${sectionId}`,
          });
        }

        // Add Concept if it exists
        if (conceptId && concept) {
          newBreadcrumbs.push({
            name: concept.title,
            href: `/dashboard/my-courses/${courseId}/concepts/${conceptId}`,
          });
        }
      }

      // Limit to 4 breadcrumbs if needed
      if (newBreadcrumbs.length > 4) {
        newBreadcrumbs.splice(1, newBreadcrumbs.length - 4);
      }

      setBreadcrumbs(newBreadcrumbs);
    }

    generateBreadcrumbs();
  }, [pathname, course, section, concept, courseId, sectionId, conceptId]);

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap overflow-hidden">
        {breadcrumbs.map((segment, index) => (
          <React.Fragment key={segment.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem className="min-w-0">
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage className="truncate max-w-[200px]">
                  {segment.name}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={segment.href}
                  className="truncate max-w-[200px]"
                >
                  {segment.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
