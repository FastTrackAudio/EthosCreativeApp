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

      // Skip ID segments and limit collection
      for (let i = 1; i < pathSegments.length; i++) {
        const segment = pathSegments[i];

        // Skip numeric IDs and specific segments
        if (
          /^\d+$/.test(segment) ||
          ["my-courses", "sections", "concepts"].includes(segment)
        ) {
          continue;
        }

        currentPath += `/${segment}`;
        newBreadcrumbs.push({
          name:
            segment.charAt(0).toUpperCase() +
            segment.slice(1).replace(/-/g, " "),
          href: currentPath,
        });

        // Limit to 4 breadcrumbs
        if (newBreadcrumbs.length >= 4) break;
      }

      setBreadcrumbs(newBreadcrumbs);
    }

    fetchBreadcrumbs();
  }, [pathname]);

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

// Remove unused fetch functions since we're not using them anymore
