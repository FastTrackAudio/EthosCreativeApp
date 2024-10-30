import React from "react"
import { notFound } from "next/navigation"
import prisma from "@/app/utils/db"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { CustomVideoPlayer } from "@/features/video-player/VideoPlayer"
import { Music, Type, Video } from "lucide-react"

const BlockNoteEditor = dynamic(() => import("@/components/BlockNoteEditor"), {
  ssr: false,
})

export default async function ConceptEditorPage({
  params,
}: {
  params: { courseId: string; sectionId: string; conceptId: string }
}) {
  const concept = await prisma.concept.findUnique({
    where: { id: params.conceptId },
    include: {
      section: {
        select: {
          title: true,
          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  })

  if (!concept) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="text-sm text-muted-foreground mb-2">
          {concept.section.course.title} / {concept.section.title}
        </div>
        <h1 className="text-2xl font-bold mb-2">{concept.title}</h1>
      </div>

      {/* Insert Content Buttons */}
      <div className="flex gap-4 mb-8">
        <Button variant="outline" size="lg" className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Insert Video
        </Button>
        <Button variant="outline" size="lg" className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Insert Audio
        </Button>
        <Button variant="outline" size="lg" className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Insert Text
        </Button>
      </div>

      {/* Content Area */}
      <div className="space-y-8">
        {/* Content blocks will be rendered here */}
      </div>
    </div>
  )
}
