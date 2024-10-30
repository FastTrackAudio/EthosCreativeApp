"use client"

import React, { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import prisma from "@/app/utils/db"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { CustomVideoPlayer } from "@/features/video-player/VideoPlayer"
import {
  Music,
  Type,
  Video,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Save,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { AudioPlayer } from "@/features/audio-player/AudioPlayer"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import Image from "next/image"
import { OurFileRouter } from "@/app/api/uploadthing/core"
import { ResizableImage } from "@/components/ui/resizable-image"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { ResizableVideo } from "@/components/ui/resizable-video"
import { Skeleton } from "@/components/ui/skeleton"

interface ImageSize {
  width: string
  height: string
}

interface TextBlock {
  content: string
  isTransparent?: boolean
}

const BlockNoteEditorComponent = dynamic(
  () =>
    import("@/components/BlockNoteEditor").then(
      (mod) => mod.BlockNoteEditorComponent
    ),
  { ssr: false }
)

// Update the ContentBlock type to include id and order
type ContentBlock = {
  id: string
  type: "audio" | "video" | "image" | "text"
  order: number
  content: {
    url?: string
    title?: string
    size?: {
      width: string
      height: string
    }
    textContent?: string
    isTransparent?: boolean
  }
}

// Add the ConceptContent type
interface ConceptContent {
  version: string
  blocks: ContentBlock[]
}

export default function ConceptEditorPage({
  params,
}: {
  params: { courseId: string; sectionId: string; conceptId: string }
}) {
  const { toast } = useToast()

  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [addedVideos, setAddedVideos] = useState<
    Array<{ url: string; title?: string }>
  >([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const [showAudioDialog, setShowAudioDialog] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const [addedAudios, setAddedAudios] = useState<
    Array<{ url: string; title?: string }>
  >([])
  const [editingAudioIndex, setEditingAudioIndex] = useState<number | null>(
    null
  )
  const [audioTitle, setAudioTitle] = useState("")

  const [addedImages, setAddedImages] = useState<
    Array<{ url: string; title?: string; size?: ImageSize }>
  >([])
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(
    null
  )
  const [imageTitle, setImageTitle] = useState("")

  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageSize, setImageSize] = useState<ImageSize>({
    width: "100%",
    height: "auto",
  })

  const [addedTexts, setAddedTexts] = useState<TextBlock[]>([])
  const [editingTextIndex, setEditingTextIndex] = useState<number | null>(null)

  // In the component, replace individual content arrays with a single array
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])

  const [conceptTitle, setConceptTitle] = useState<string>("")

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchConceptTitle = async () => {
      try {
        const response = await fetch(`/api/concepts/${params.conceptId}`)
        const data = await response.json()
        setConceptTitle(data.title)
      } catch (error) {
        console.error("Failed to fetch concept title:", error)
      }
    }

    fetchConceptTitle()
  }, [params.conceptId])

  useEffect(() => {
    const fetchConceptContent = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/concepts/${params.conceptId}`)
        const data = await response.json()

        console.log("Raw API Response:", data)
        console.log("Content from API:", data.content)

        if (data.content) {
          try {
            const parsedContent =
              typeof data.content === "string"
                ? JSON.parse(data.content)
                : data.content

            console.log("Parsed Content:", parsedContent)

            const validContent: ConceptContent = {
              version: parsedContent.version || "1",
              blocks: Array.isArray(parsedContent.blocks)
                ? parsedContent.blocks.map((block: any, index: number) => ({
                    id: block.id || `block-${index}`,
                    type: block.type,
                    order: block.order || index,
                    content: block.content || {},
                  }))
                : [],
            }

            console.log("Validated Content:", validContent)
            setContentBlocks(validContent.blocks)
          } catch (parseError) {
            console.error("Error parsing content:", parseError)
            setContentBlocks([])
          }
        } else {
          setContentBlocks([])
        }
      } catch (error) {
        console.error("Failed to fetch concept content:", error)
        toast({
          title: "Error loading content",
          description: "There was a problem loading the concept content.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchConceptContent()
  }, [params.conceptId])

  const handleAddVideo = () => {
    if (videoUrl) {
      setContentBlocks([
        ...contentBlocks,
        {
          id: `video-${Date.now()}`,
          type: "video",
          order: contentBlocks.length,
          content: {
            url: videoUrl,
            size: {
              width: "100%",
              height: "auto",
            },
          },
        },
      ])
      setVideoUrl("")
      setShowVideoDialog(false)
    }
  }

  const handleEditVideo = (index: number, newUrl: string) => {
    const newVideos = [...addedVideos]
    newVideos[index] = { url: newUrl }
    setAddedVideos(newVideos)
    setEditingIndex(null)
  }

  const handleDeleteVideo = (index: number) => {
    const newVideos = [...addedVideos]
    newVideos.splice(index, 1)
    setAddedVideos(newVideos)
  }

  const handleAddAudio = () => {
    if (audioUrl) {
      setContentBlocks([
        ...contentBlocks,
        {
          id: `audio-${Date.now()}`,
          type: "audio",
          order: contentBlocks.length,
          content: { url: audioUrl, title: audioTitle },
        },
      ])
      setAudioUrl("")
      setAudioTitle("")
      setShowAudioDialog(false)
    }
  }

  const handleEditAudio = (index: number, newUrl: string) => {
    const newAudios = [...addedAudios]
    newAudios[index] = { url: newUrl }
    setAddedAudios(newAudios)
    setEditingAudioIndex(null)
  }

  const handleDeleteAudio = (index: number) => {
    const newAudios = [...addedAudios]
    newAudios.splice(index, 1)
    setAddedAudios(newAudios)
  }

  const handleAddImage = () => {
    if (imageUrl) {
      setContentBlocks([
        ...contentBlocks,
        {
          id: `image-${Date.now()}`,
          type: "image",
          order: contentBlocks.length,
          content: {
            url: imageUrl,
            title: imageTitle,
            size: imageSize,
          },
        },
      ])
      setImageUrl("")
      setImageTitle("")
      setImageSize({ width: "100%", height: "auto" })
      setShowImageDialog(false)
    }
  }

  const moveItem = (array: any[], fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= array.length) return array
    const newArray = [...array]
    const [movedItem] = newArray.splice(fromIndex, 1)
    newArray.splice(toIndex, 0, movedItem)
    return newArray
  }

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= contentBlocks.length) return

    const newBlocks = [...contentBlocks]
    const [movedBlock] = newBlocks.splice(index, 1)
    newBlocks.splice(newIndex, 0, movedBlock)

    // Update order for all blocks
    const reorderedBlocks = newBlocks.map((block, idx) => ({
      ...block,
      order: idx,
    }))

    setContentBlocks(reorderedBlocks)
  }

  const handleSave = async () => {
    const content: ConceptContent = {
      version: "1",
      blocks: contentBlocks.map((block, index) => ({
        id: block.id || `block-${index}`,
        type: block.type,
        order: index,
        content: block.content,
      })),
    }

    console.log("Content being saved:", content)
    console.log("JSON stringified content:", JSON.stringify(content))

    try {
      const response = await fetch(`/api/concepts/${params.conceptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: JSON.stringify(content),
        }),
      })

      const result = await response.json()
      console.log("Save response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Failed to save")
      }

      toast({
        title: "Changes saved",
        description: "Your content has been saved successfully.",
      })
    } catch (error) {
      console.error("Failed to save content:", error)
      toast({
        title: "Error saving changes",
        description: "There was a problem saving your content.",
        variant: "destructive",
      })
    }
  }

  const handleAddText = () => {
    setContentBlocks([
      ...contentBlocks,
      {
        id: `text-${Date.now()}`,
        type: "text",
        order: contentBlocks.length,
        content: {
          textContent: JSON.stringify([
            {
              type: "paragraph",
              content: [],
            },
          ]),
          isTransparent: false,
        },
      },
    ])
  }

  const LoadingSkeletons = () => (
    <div className="space-y-8 w-full">
      {/* Video skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>

      {/* Text block skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-8 w-2/3" />
      </div>

      {/* Image skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>

      {/* Audio skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-2">
              {isLoading ? (
                <Skeleton className="h-4 w-48" />
              ) : /* Course and section info */
              null}
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {isLoading ? (
                <Skeleton className="h-8 w-64" />
              ) : (
                conceptTitle || "Concept Editor"
              )}
            </h1>
          </div>
          <Button
            onClick={handleSave}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-8 flex flex-col items-center">
        {isLoading ? (
          <LoadingSkeletons />
        ) : (
          contentBlocks.map((block, index) => (
            <div key={index} className="group relative w-full">
              <div className="absolute -left-16 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleMoveBlock(index, "up")}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleMoveBlock(index, "down")}
                  disabled={index === contentBlocks.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditingIndex(index)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive/80"
                  onClick={() => {
                    const newBlocks = [...contentBlocks]
                    newBlocks.splice(index, 1)
                    setContentBlocks(newBlocks)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {editingIndex === index ? (
                <div className="flex gap-2 mb-4">
                  <Input
                    value={block.content.url || ""}
                    onChange={(e) => {
                      const newBlocks = [...contentBlocks]
                      newBlocks[index] = {
                        ...block,
                        content: { ...block.content, url: e.target.value },
                      }
                      setContentBlocks(newBlocks)
                    }}
                    placeholder={`Enter ${block.type} URL...`}
                    className="flex-1"
                  />
                  <Button onClick={() => setEditingIndex(null)}>Save</Button>
                </div>
              ) : (
                <>
                  {block.type === "video" && (
                    <div className="relative rounded-lg overflow-hidden w-full">
                      <ResizableVideo
                        src={block.content.url!}
                        title={block.content.title || "Video content"}
                        initialWidth={block.content.size?.width || "100%"}
                        initialHeight={block.content.size?.height || "auto"}
                        onResize={(width, height) => {
                          const newBlocks = [...contentBlocks]
                          newBlocks[index] = {
                            ...block,
                            content: {
                              ...block.content,
                              size: {
                                width: `${width}px`,
                                height: height ? `${height}px` : "auto",
                              },
                            },
                          }
                          setContentBlocks(newBlocks)
                        }}
                      />
                    </div>
                  )}
                  {block.type === "audio" && (
                    <AudioPlayer
                      src={block.content.url}
                      title={block.content.title}
                    />
                  )}
                  {block.type === "image" && (
                    <ResizableImage
                      src={block.content.url!}
                      alt={block.content.title || "Content image"}
                      initialWidth={block.content.size?.width}
                      initialHeight={block.content.size?.height}
                      onResize={(width, height) => {
                        const newBlocks = [...contentBlocks]
                        newBlocks[index] = {
                          ...block,
                          content: {
                            ...block.content,
                            size: {
                              width: `${width}px`,
                              height: height ? `${height}px` : "auto",
                            },
                          },
                        }
                        setContentBlocks(newBlocks)
                      }}
                    />
                  )}
                  {block.type === "text" && (
                    <div
                      className={cn(
                        "w-full transition-colors",
                        block.content.isTransparent &&
                          "[&_.bn-container]:bg-transparent [&_.bn-editor]:bg-transparent"
                      )}
                    >
                      <BlockNoteEditorComponent
                        conceptId={params.conceptId}
                        initialContent={block.content.textContent || null}
                        onUpdate={(content) => {
                          const newBlocks = [...contentBlocks]
                          newBlocks[index] = {
                            ...block,
                            content: {
                              ...block.content,
                              textContent: content,
                            },
                          }
                          setContentBlocks(newBlocks)
                        }}
                        isTransparent={block.content.isTransparent}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Insert Content Buttons */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg z-50">
        <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Video className="h-5 w-5" />
              Insert Video
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Insert Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <CustomVideoPlayer
                src={videoUrl}
                title="Video Preview"
                autoPlay={false}
                muted={true}
                controls={true}
              />
              <div className="flex gap-2">
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enter video URL..."
                  className="flex-1"
                />
                <Button onClick={handleAddVideo}>Add Video</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAudioDialog} onOpenChange={setShowAudioDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Music className="h-5 w-5" />
              Insert Audio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Insert Audio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={audioTitle}
                    onChange={(e) => setAudioTitle(e.target.value)}
                    placeholder="Enter audio title..."
                  />
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="Enter audio URL..."
                  />
                </div>
              </div>
              <AudioPlayer
                src={audioUrl}
                title={audioTitle || "Audio Preview"}
                autoPlay={false}
                muted={false}
              />
              <div className="flex justify-end">
                <Button onClick={handleAddAudio} disabled={!audioUrl}>
                  Add Audio
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-5 w-5" />
              Insert Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Insert Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    placeholder="Enter image title..."
                  />
                </div>
                <div>
                  <Label>URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Enter image URL or use upload below..."
                      className="flex-1"
                    />
                    <Button onClick={handleAddImage} disabled={!imageUrl}>
                      Add Image
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Width</Label>
                    <Input
                      value={imageSize.width}
                      onChange={(e) =>
                        setImageSize({ ...imageSize, width: e.target.value })
                      }
                      placeholder="e.g., 100%, 500px"
                    />
                  </div>
                  <div>
                    <Label>Height</Label>
                    <Input
                      value={imageSize.height}
                      onChange={(e) =>
                        setImageSize({ ...imageSize, height: e.target.value })
                      }
                      placeholder="e.g., auto, 300px"
                    />
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {imageUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <Image
                      src={imageUrl}
                      alt="Preview"
                      width={800}
                      height={400}
                      className="object-contain"
                      style={{
                        width: imageSize.width,
                        height: imageSize.height,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Upload Image</Label>
                <ImageUpload
                  value={imageUrl}
                  onChange={(url) => {
                    if (url) {
                      setImageUrl(url)
                    }
                  }}
                  disabled={false}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="lg"
          className="flex items-center gap-2"
          onClick={handleAddText}
        >
          <Type className="h-5 w-5" />
          Insert Text
        </Button>
      </div>

      <div className="h-32" />
    </div>
  )
}
