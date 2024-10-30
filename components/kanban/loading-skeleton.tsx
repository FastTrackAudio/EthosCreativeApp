"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SectionSkeleton() {
  return (
    <Card className="w-80 flex flex-col">
      <CardHeader className="p-3 space-y-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardHeader>
      <div className="p-3 pt-0 space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-3">
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <Skeleton className="h-32 w-full rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
          </Card>
        ))}
        <Skeleton className="h-9 w-full rounded" />
      </div>
    </Card>
  )
}
