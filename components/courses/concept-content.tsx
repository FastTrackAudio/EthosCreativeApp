"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Save,
  CheckCircle,
  Video,
  Music,
  Image as ImageIcon,
  Type,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { BlockNoteEditorComponent } from "@/components/BlockNoteEditor";
import { CustomVideoPlayer } from "@/features/video-player/VideoPlayer";
import { AudioPlayer } from "@/features/audio-player/AudioPlayer";
import { ResizableImage } from "@/components/ui/resizable-image";
import { ResizableVideo } from "@/components/ui/resizable-video";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ConceptContentProps {
  conceptId: string;
  courseId: string;
  editorMode?: boolean;
}

export function ConceptContent({
  conceptId,
  courseId,
  editorMode = false,
}: ConceptContentProps) {
  const queryClient = useQueryClient();
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Add state for media dialogs
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  // Add state for media content
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioTitle, setAudioTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageTitle, setImageTitle] = useState("");

  const router = useRouter();

  // Fetch concept data
  const { data: concept, isLoading } = useQuery({
    queryKey: ["concept", conceptId],
    queryFn: async () => {
      const response = await axios.get(`/api/concepts/${conceptId}`);
      const data = response.data;

      // Parse content if it's a string
      if (typeof data.content === "string") {
        data.content = JSON.parse(data.content);
      }

      return data;
    },
  });

  // Parse the initial content when concept data is loaded
  useEffect(() => {
    if (concept?.content) {
      try {
        const parsedContent =
          typeof concept.content === "string"
            ? JSON.parse(concept.content)
            : concept.content;

        setContentBlocks(parsedContent.blocks || []);
      } catch (error) {
        console.error("Error parsing content:", error);
        setContentBlocks([]);
      }
    }
  }, [concept]);

  // Save changes mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const content = {
        version: "1",
        blocks: contentBlocks,
      };

      await axios.patch(`/api/concepts/${conceptId}`, {
        content: JSON.stringify(content), // Save as stringified JSON
      });
    },
    onSuccess: () => {
      toast.success("Changes saved successfully");
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["concept", conceptId] });
    },
    onError: () => {
      toast.error("Failed to save changes");
    },
  });

  // Handlers for adding content
  const handleAddBlock = (newBlock: any) => {
    setContentBlocks([...contentBlocks, newBlock]);
    setHasUnsavedChanges(true);
  };

  const handleAddVideo = () => {
    if (videoUrl) {
      const newBlock = {
        id: `video-${Date.now()}`,
        type: "video",
        order: contentBlocks.length,
        content: {
          url: videoUrl,
          size: { width: "100%", height: "auto" },
        },
      };
      setContentBlocks([...contentBlocks, newBlock]);
      setHasUnsavedChanges(true);
      setVideoUrl("");
      setShowVideoDialog(false);
    }
  };

  const handleAddAudio = () => {
    if (audioUrl) {
      const newBlock = {
        id: `audio-${Date.now()}`,
        type: "audio",
        order: contentBlocks.length,
        content: {
          url: audioUrl,
          title: audioTitle,
        },
      };
      setContentBlocks([...contentBlocks, newBlock]);
      setHasUnsavedChanges(true);
      setAudioUrl("");
      setAudioTitle("");
      setShowAudioDialog(false);
    }
  };

  const handleAddImage = () => {
    if (imageUrl) {
      const newBlock = {
        id: `image-${Date.now()}`,
        type: "image",
        order: contentBlocks.length,
        content: {
          url: imageUrl,
          title: imageTitle,
          size: { width: "100%", height: "auto" },
        },
      };
      setContentBlocks([...contentBlocks, newBlock]);
      setHasUnsavedChanges(true);
      setImageUrl("");
      setImageTitle("");
      setShowImageDialog(false);
    }
  };

  const handleAddText = () => {
    const newBlock = {
      id: `text-${Date.now()}`,
      type: "text",
      order: contentBlocks.length,
      content: {
        textContent: "",
        isTransparent: false,
      },
    };
    setContentBlocks([...contentBlocks, newBlock]);
    setHasUnsavedChanges(true);
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...contentBlocks];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newBlocks.length) return;

    const [movedBlock] = newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, movedBlock);
    setContentBlocks(newBlocks);
    setHasUnsavedChanges(true);
  };

  const handleDeleteBlock = (index: number) => {
    const newBlocks = [...contentBlocks];
    newBlocks.splice(index, 1);
    setContentBlocks(newBlocks);
    setHasUnsavedChanges(true);
  };

  const handleToggleTransparent = (index: number) => {
    const newBlocks = [...contentBlocks];
    if (newBlocks[index].type === "text") {
      newBlocks[index] = {
        ...newBlocks[index],
        content: {
          ...newBlocks[index].content,
          isTransparent: !newBlocks[index].content.isTransparent,
        },
      };
      setContentBlocks(newBlocks);
      setHasUnsavedChanges(true);
    }
  };

  const updateConceptMutation = useMutation({
    mutationFn: async (updatedContent: string) => {
      const response = await fetch(`/api/concepts/${conceptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: updatedContent }),
      });
      if (!response.ok) {
        throw new Error("Failed to update concept");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Concept saved successfully", {
        duration: 2000,
        onAutoClose: () => {
          queryClient.invalidateQueries({ queryKey: ["concepts", courseId] });
          // Use the courseId passed as prop
          router.push(
            `/dashboard/admin/manage-courses/${courseId}/manage-sections`
          );
        },
      });
    },
    onError: (error) => {
      toast.error("Failed to save concept");
      console.error("Error saving concept:", error);
    },
  });

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {isLoading ? <Skeleton className="h-8 w-64" /> : concept?.title}
            </h1>
          </div>
          {editorMode && (
            <Button
              onClick={() => saveMutation.mutate(concept?.content)}
              className="flex items-center gap-2"
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          {contentBlocks.map((block, index) => (
            <div key={block.id} className="relative group">
              {editorMode && (
                <div className="absolute -left-16 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMoveBlock(index, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMoveBlock(index, "down")}
                    disabled={index === contentBlocks.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  {block.type === "text" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        block.content.isTransparent && "text-muted-foreground"
                      )}
                      onClick={() => handleToggleTransparent(index)}
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit {block.type}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              value={block.content.title || ""}
                              onChange={(e) => {
                                const newBlocks = [...contentBlocks];
                                newBlocks[index] = {
                                  ...block,
                                  content: {
                                    ...block.content,
                                    title: e.target.value,
                                  },
                                };
                                setContentBlocks(newBlocks);
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>URL</Label>
                            <Input
                              value={block.content.url || ""}
                              onChange={(e) => {
                                const newBlocks = [...contentBlocks];
                                newBlocks[index] = {
                                  ...block,
                                  content: {
                                    ...block.content,
                                    url: e.target.value,
                                  },
                                };
                                setContentBlocks(newBlocks);
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>
                          {block.type === "image" && (
                            <ImageUpload
                              value={block.content.url || ""}
                              onChange={(url) => {
                                const newBlocks = [...contentBlocks];
                                newBlocks[index] = {
                                  ...block,
                                  content: {
                                    ...block.content,
                                    url: url || "",
                                  },
                                };
                                setContentBlocks(newBlocks);
                                setHasUnsavedChanges(true);
                              }}
                            />
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteBlock(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {block.type === "video" && (
                <ResizableVideo
                  src={block.content.url}
                  title={block.content.title || "Video content"}
                  initialWidth={block.content.size?.width || "100%"}
                  initialHeight={block.content.size?.height || "auto"}
                />
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
                  editable={editorMode}
                  onResize={
                    editorMode
                      ? (width, height) => {
                          const newBlocks = [...contentBlocks];
                          newBlocks[index] = {
                            ...block,
                            content: {
                              ...block.content,
                              size: {
                                width: `${width}px`,
                                height: height ? `${height}px` : "auto",
                              },
                            },
                          };
                          setContentBlocks(newBlocks);
                          setHasUnsavedChanges(true);
                        }
                      : undefined
                  }
                />
              )}
              {block.type === "text" && (
                <BlockNoteEditorComponent
                  conceptId={conceptId}
                  courseId={courseId}
                  sectionId={concept?.sectionId || ""}
                  initialContent={block.content.textContent}
                  editorMode={editorMode}
                  isTransparent={block.content.isTransparent}
                  onChange={(content) => {
                    const newBlocks = [...contentBlocks];
                    newBlocks[index] = {
                      ...block,
                      content: { ...block.content, textContent: content },
                    };
                    setContentBlocks(newBlocks);
                    setHasUnsavedChanges(true);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Insert Content Buttons - Only show in editor mode */}
      {editorMode && (
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Video</DialogTitle>
                <DialogDescription>
                  Add a video to your concept by providing a URL.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enter video URL..."
                />
                {videoUrl && (
                  <CustomVideoPlayer src={videoUrl} title="Video Preview" />
                )}
                <Button onClick={handleAddVideo}>Add Video</Button>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Audio</DialogTitle>
                <DialogDescription>
                  Add an audio track to your concept by providing a URL and
                  title.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
                {audioUrl && (
                  <AudioPlayer
                    src={audioUrl}
                    title={audioTitle || "Audio Preview"}
                  />
                )}
                <Button onClick={handleAddAudio}>Add Audio</Button>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Image</DialogTitle>
                <DialogDescription>
                  Add an image to your concept by uploading or providing a URL.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    placeholder="Enter image title..."
                  />
                </div>
                <ImageUpload
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url || "")}
                />
                <Button onClick={handleAddImage}>Add Image</Button>
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
      )}

      {/* Add bottom padding to prevent content from being hidden behind buttons */}
      <div className="h-32" />
    </div>
  );
}
