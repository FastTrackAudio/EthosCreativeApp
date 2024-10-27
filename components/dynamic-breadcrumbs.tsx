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

interface BreadcrumbSegment {
  name: string;
  href: string;
}

export default function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbSegment[]>([]);

  useEffect(() => {
    async function fetchBreadcrumbs() {
      const pathSegments = pathname.split("/").filter((segment) => segment);
      const newBreadcrumbs: BreadcrumbSegment[] = [
        { name: "Dashboard", href: "/dashboard" },
      ];

      let currentPath = "/dashboard";
      for (let i = 1; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        currentPath += `/${segment}`;

        if (segment === "my-courses") {
          continue; // Skip this segment
        } else if (segment === "sections") {
          continue; // Skip this segment
        } else if (segment === "concepts") {
          continue; // Skip this segment
        } else if (/^\d+$/.test(segment)) {
          // Check if segment is a number (ID)
          const type = pathSegments[i - 1]; // Get the type from the previous segment
          switch (type) {
            case "my-courses":
              const courseName = await fetchCourseName(segment);
              newBreadcrumbs.push({ name: courseName, href: currentPath });
              break;
            case "sections":
              const sectionName = await fetchSectionName(segment);
              newBreadcrumbs.push({ name: sectionName, href: currentPath });
              break;
            case "concepts":
              const conceptName = await fetchConceptName(segment);
              newBreadcrumbs.push({ name: conceptName, href: currentPath });
              break;
          }
        } else {
          // For any other segments, just add them as is
          newBreadcrumbs.push({ name: segment, href: currentPath });
        }
      }

      setBreadcrumbs(newBreadcrumbs);
    }

    fetchBreadcrumbs();
  }, [pathname]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((segment, index) => (
          <React.Fragment key={segment.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{segment.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={segment.href}>
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

// These functions need to be implemented to fetch the actual names
async function fetchCourseName(courseId: string): Promise<string> {
  // Implement API call to fetch course name
  return "Course Name";
}

async function fetchSectionName(sectionId: string): Promise<string> {
  // Implement API call to fetch section name
  return "Section Name";
}

async function fetchConceptName(conceptId: string): Promise<string> {
  // Implement API call to fetch concept name
  return "Concept Name";
}
