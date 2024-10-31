"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { PartialBlock } from "@blocknote/core"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const BlockNoteEditorComponent = dynamic(
  () =>
    import("@/components/BlockNoteEditor").then(
      (mod) => mod.BlockNoteEditorComponent
    ),
  { ssr: false }
)

interface ContentBlock {
  id: string
  type: "text" | "image" | "video" | "audio" | "file"
  content: string
  metadata?: {
    url?: string
    caption?: string
    mimeType?: string
    fileSize?: number
    duration?: number
    dimensions?: {
      width: number
      height: number
    }
  }
  order: number
  createdAt: string
  updatedAt: string
}

interface ConceptPageProps {
  params: {
    courseId: string
    sectionId: string
    conceptId: string
  }
}

export default function ConceptPage({ params }: ConceptPageProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [content, setContent] = useState<PartialBlock[]>([])
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [conceptData, setConceptData] = useState<{
    id: string
    title: string
    description?: string | null
    updatedAt: string
    content: PartialBlock[]
    blocks: ContentBlock[]
  }>({
    id: "",
    title: "",
    updatedAt: "",
    content: [],
    blocks: [],
  })

  // Fetch initial content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/concepts/${params.conceptId}`)
        if (!response.ok) throw new Error("Failed to fetch content")

        const data = await response.json()
        console.log("Fetched concept data:", data)

        // Parse blocks from the database
        let parsedBlocks: ContentBlock[] = []
        if (data.blocks) {
          try {
            parsedBlocks =
              typeof data.blocks === "string"
                ? JSON.parse(data.blocks)
                : data.blocks
          } catch (error) {
            console.error("Error parsing blocks:", error)
            parsedBlocks = []
          }
        }

        // Parse editor content
        let parsedContent: PartialBlock[] = []
        if (data.content) {
          try {
            parsedContent =
              typeof data.content === "string"
                ? JSON.parse(data.content)
                : data.content
          } catch (error) {
            console.error("Error parsing content:", error)
            parsedContent = [{ type: "paragraph", content: "" }]
          }
        }

        setConceptData({
          id: data.id,
          title: data.title,
          description: data.description,
          updatedAt: data.updatedAt,
          content: parsedContent,
          blocks: parsedBlocks,
        })
        setContent(parsedContent)
        setContentBlocks(parsedBlocks)
      } catch (error) {
        console.error("Error fetching content:", error)
        toast.error("Failed to load content")
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [params.conceptId])

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Format all content for saving
      const contentToSave = {
        content: content,
        blocks: contentBlocks.map((block, index) => ({
          ...block,
          order: index,
          updatedAt: new Date().toISOString(),
        })),
        metadata: {
          version: 1,
          lastUpdated: new Date().toISOString(),
          blockCount: contentBlocks.length,
          editorBlockCount: content.length,
          conceptId: params.conceptId,
          sectionId: params.sectionId,
          courseId: params.courseId,
        },
      }

      console.log("Saving content:", JSON.stringify(contentToSave, null, 2))

      const response = await fetch(`/api/concepts/${params.conceptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contentToSave),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save content")
      }

      // Update local state with saved data
      setConceptData((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        content: data.concept.content,
        blocks: data.concept.blocks,
      }))

      toast.success("All content saved successfully")
    } catch (error) {
      console.error("[SAVE_ERROR]", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to save content"
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading content...</div>
      </div>
    )
  }

  return (
    <div className="p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">
            {conceptData.title}{" "}
            <span className="text-sm text-muted-foreground">
              ({conceptData.id})
            </span>
          </h1>
          {conceptData.description && (
            <p className="text-muted-foreground">{conceptData.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(conceptData.updatedAt).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Content blocks: {contentBlocks.length}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      <div className="h-[calc(100vh-150px)] w-full border border-gray-300 rounded-lg overflow-hidden">
        <BlockNoteEditorComponent
          conceptId={params.conceptId}
          sectionId={params.sectionId}
          courseId={params.courseId}
          onChange={setContent}
          initialContent={content}
        />
      </div>
    </div>
  )
}
