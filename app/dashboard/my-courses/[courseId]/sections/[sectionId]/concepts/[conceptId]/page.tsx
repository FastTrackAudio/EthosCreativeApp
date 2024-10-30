"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { PartialBlock } from "@blocknote/core"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { CustomVideoPlayer } from "@/features/video-player/VideoPlayer"
import { AudioPlayer } from "@/features/audio-player/AudioPlayer"

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
  const [isLoading, setIsLoading] = useState(true)
  const [hasExistingContent, setHasExistingContent] = useState(false)
  const [content, setContent] = useState<PartialBlock[]>([])
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
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
        console.log("🔍 Starting content fetch for concept:", params.conceptId)

        const response = await fetch(`/api/concepts/${params.conceptId}`)
        const data = await response.json()

        console.log("📥 Raw API Response:", data)

        if (!response.ok) {
          throw new Error(
            `Failed to fetch content: ${data.error || response.statusText}`
          )
        }

        // Parse the structured content
        if (data.content && typeof data.content === "object") {
          const structuredContent = data.content
          console.log("📦 Structured content:", structuredContent)

          // Parse editor content properly
          let editorContent = []
          if (structuredContent.editor?.content) {
            if (typeof structuredContent.editor.content === "string") {
              try {
                editorContent = JSON.parse(structuredContent.editor.content)
              } catch (error) {
                console.error("Error parsing editor content:", error)
              }
            } else {
              editorContent = structuredContent.editor.content
            }
          }

          // Parse blocks properly
          const contentBlocks = (structuredContent.blocks || []).map(
            (block: any) => {
              // Handle BlockNote format
              if (block.type === "video" && block.content?.url) {
                return {
                  id: block.id,
                  type: "video",
                  order: block.order || 0,
                  content: "",
                  metadata: {
                    url: block.content.url,
                    caption: block.content.caption || "",
                    updatedAt:
                      block.metadata?.updatedAt || new Date().toISOString(),
                  },
                }
              }
              // Handle other formats
              return {
                id: block.id,
                type: block.type,
                order: block.order || 0,
                content: typeof block.content === "string" ? block.content : "",
                metadata: {
                  ...block.metadata,
                  url: block.content?.url || block.metadata?.url,
                  caption: block.content?.caption || block.metadata?.caption,
                  updatedAt:
                    block.metadata?.updatedAt || new Date().toISOString(),
                },
              }
            }
          )

          console.log("🔄 Processed content:", {
            editorContent,
            contentBlocks,
          })

          setConceptData({
            id: data.id,
            title: data.title,
            description: data.description,
            updatedAt: data.updatedAt,
            content: editorContent,
            blocks: contentBlocks,
          })
          setContent(editorContent)
          setContentBlocks(contentBlocks)
          setHasExistingContent(
            editorContent.length > 0 || contentBlocks.length > 0
          )
        } else {
          console.warn("⚠️ No structured content found:", data.content)
          setContent([])
          setContentBlocks([])
        }
      } catch (error) {
        console.error("❌ Error in fetchContent:", error)
        toast.error("Failed to load content")
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [params.conceptId])

  // Debug render cycle
  useEffect(() => {
    console.log("🔄 Render cycle:", {
      isLoading,
      hasContent: content.length > 0,
      hasBlocks: contentBlocks.length > 0,
      contentBlockTypes: contentBlocks.map((b) => b.type),
      contentTypes: content.map((b) => b.type),
    })
  }, [isLoading, content, contentBlocks])

  // Add debug rendering for content blocks
  console.log("Render Debug:", {
    contentBlocksLength: contentBlocks.length,
    contentBlocks,
    hasContent: content.length > 0,
    content,
  })

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Get the content from state
      const contentToSave = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        editor: {
          content: content, // BlockNote content
          settings: {
            defaultStyles: {},
            customStyles: [],
          },
        },
        blocks: contentBlocks,
        metadata: {
          conceptId: params.conceptId,
          blockCount: contentBlocks.length,
          editorBlockCount: content.length,
        },
      }

      console.log("Saving content:", contentToSave)

      const response = await fetch(`/api/concepts/${params.conceptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentToSave,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save content")
      }

      // Save to localStorage as backup
      localStorage.setItem(
        `concept-${params.conceptId}-full`,
        JSON.stringify(contentToSave)
      )

      toast.success("Content saved successfully")
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save content")
    } finally {
      setIsSaving(false)
    }
  }

  // Add auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (content.length > 0 || contentBlocks.length > 0) {
        handleSave()
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [content, contentBlocks])

  // Load content on mount
  useEffect(() => {
    const loadSavedContent = () => {
      const savedContent = localStorage.getItem(
        `concept-${params.conceptId}-full`
      )
      if (savedContent) {
        try {
          const parsed = JSON.parse(savedContent)
          setContent(parsed.editor.content)
          setContentBlocks(parsed.blocks)
          setHasExistingContent(true)
        } catch (error) {
          console.error("Error loading saved content:", error)
        }
      }
    }

    loadSavedContent()
  }, [params.conceptId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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
          <div className="flex gap-2 text-sm text-muted-foreground">
            <p>
              Last updated: {new Date(conceptData.updatedAt).toLocaleString()}
            </p>
            <p>•</p>
            <p>Content blocks: {contentBlocks.length}</p>
            {hasExistingContent && <p>• Has saved content</p>}
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {/* Render all content types */}
      {contentBlocks.length > 0 && (
        <div className="mb-4 space-y-4">
          {contentBlocks.map((block) => (
            <div key={block.id} className="p-4 border rounded-lg bg-card">
              {block.type === "text" && (
                <div className="prose dark:prose-invert">{block.content}</div>
              )}

              {block.type === "video" && block.metadata?.url && (
                <div className="space-y-2">
                  <CustomVideoPlayer
                    src={block.metadata.url}
                    title={block.metadata.caption}
                    controls={true}
                  />
                </div>
              )}

              {block.type === "audio" && block.metadata?.url && (
                <div className="space-y-2">
                  <AudioPlayer
                    src={block.metadata.url}
                    title={block.metadata.caption}
                  />
                </div>
              )}

              {block.type === "image" && block.metadata?.url && (
                <div className="space-y-2">
                  <img
                    src={block.metadata.url}
                    alt={block.metadata.caption || ""}
                    className="rounded-lg max-h-96 object-contain"
                  />
                  {block.metadata.caption && (
                    <p className="text-sm text-muted-foreground text-center">
                      {block.metadata.caption}
                    </p>
                  )}
                </div>
              )}

              {block.type === "file" && block.metadata?.url && (
                <div className="space-y-2">
                  <a
                    href={block.metadata.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                  >
                    <span>{block.metadata.caption || "Download File"}</span>
                    {block.metadata.fileSize && (
                      <span className="text-sm text-muted-foreground">
                        ({Math.round(block.metadata.fileSize / 1024)} KB)
                      </span>
                    )}
                  </a>
                </div>
              )}

              <div className="mt-2 text-sm text-muted-foreground">
                Last modified: {new Date(block.updatedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add a debug section in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-4 border rounded bg-slate-50 dark:bg-slate-900">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(
              {
                contentBlocks: contentBlocks.map((block) => ({
                  id: block.id,
                  type: block.type,
                  hasMetadata: !!block.metadata,
                  hasUrl: !!block.metadata?.url,
                })),
                content: content.length > 0 ? "Has content" : "No content",
                blockCount: contentBlocks.length,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}

      <div className="h-[calc(100vh-150px)] w-full border border-gray-300 rounded-lg overflow-hidden">
        <BlockNoteEditorComponent
          conceptId={params.conceptId}
          onChange={setContent}
          initialContent={content}
        />
      </div>
    </div>
  )
}
