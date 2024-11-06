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
  Code2,
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
import { Textarea } from "@/components/ui/textarea";
import { FileUploadButton } from "@/components/ui/file-upload-button";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import { FileIcon } from "lucide-react";
import { Download } from "lucide-react";

interface ConceptContentProps {
  conceptId: string;
  courseId: string;
  editorMode?: boolean;
  skipFirstVideo?: boolean;
}

export function ConceptContent({
  conceptId,
  courseId,
  editorMode = false,
  skipFirstVideo = false,
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

  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [embedCode, setEmbedCode] = useState("");
  const [embedPreview, setEmbedPreview] = useState("");

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
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= contentBlocks.length) return;

    const newBlocks = [...contentBlocks];
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

  const handleAddEmbed = () => {
    if (embedCode) {
      // Wrap the embed code in a centering container
      const centeredHtml = `
        <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
          ${embedCode}
        </div>
      `;

      const newBlock = {
        id: `embed-${Date.now()}`,
        type: "embed",
        order: contentBlocks.length,
        content: {
          html: centeredHtml,
          height: "500px", // Default height
        },
      };
      setContentBlocks([...contentBlocks, newBlock]);
      setHasUnsavedChanges(true);
      setEmbedCode("");
      setEmbedPreview("");
      setShowEmbedDialog(false);
    }
  };

  // Generic script injection handler
  useEffect(() => {
    const embedBlocks = contentBlocks.filter((block) => block.type === "embed");
    const embedContainers = new Map(); // Track containers by block ID

    if (embedBlocks.length > 0) {
      embedBlocks.forEach((block) => {
        // Create a unique container for each embed
        const containerId = `embed-container-${block.id}`;
        const container = document.getElementById(containerId);
        
        if (container && !embedContainers.has(block.id)) {
          container.innerHTML = block.content.html;
          embedContainers.set(block.id, true);

          // Handle scripts separately
          const scriptMatches = block.content.html.match(
            /<script[^>]*>([\s\S]*?)<\/script>/gi
          );

          if (scriptMatches) {
            scriptMatches.forEach((scriptTag: string) => {
              const script = document.createElement("script");
              const srcMatch = scriptTag.match(/src=["'](.*?)["']/);

              if (srcMatch) {
                script.src = srcMatch[1];
              } else {
                const content = scriptTag.replace(/<script[^>]*>|<\/script>/gi, "");
                script.textContent = content;
              }

              script.async = true;
              container.appendChild(script);
            });
          }
        }
      });
    }

    // No cleanup needed as we're managing containers individually
  }, [contentBlocks]);

  // Add edit functionality for embeds
  const handleEditEmbed = (index: number, html: string) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index] = {
      ...newBlocks[index],
      content: {
        ...newBlocks[index].content,
        html,
      },
    };
    setContentBlocks(newBlocks);
    setHasUnsavedChanges(true);
  };

  const renderBlock = (block: any, index: number) => {
    switch (block.type) {
      case "video": {
        return (
          <ResizableVideo
            src={block.content.url}
            title={block.content.title || "Video content"}
            initialWidth={block.content.size?.width || "100%"}
            initialHeight={block.content.size?.height || "auto"}
          />
        );
      }
      case "audio": {
        return (
          <AudioPlayer
            src={block.content.url}
            title={block.content.title}
          />
        );
      }
      case "image": {
        return (
          <ResizableImage
            src={block.content.url}
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
                          height: `${height}px`,
                        },
                      },
                    };
                    setContentBlocks(newBlocks);
                    setHasUnsavedChanges(true);
                  }
                : undefined
            }
          />
        );
      }
      case "text": {
        return (
          <div className="relative group">
            {editorMode && (
              <div className="absolute right-2 top-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    block.content.isTransparent && "text-muted-foreground"
                  )}
                  onClick={() => handleToggleTransparent(index)}
                  title="Toggle Background"
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteBlock(index)}
                  title="Delete Block"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
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
          </div>
        );
      }
      case "embed": {
        return (
          <div className="w-full flex justify-center">
            <div className="w-full max-w-[800px] mx-auto">
              <div
                id={`embed-container-${block.id}`}
                className="min-h-[200px] w-full flex justify-center items-center"
              />
            </div>
          </div>
        );
      }
      case "file": {
        const blockIndex = contentBlocks.findIndex(b => b.id === block.id);
        
        return (
          <div className="relative group">
            {editorMode && (
              <div className="absolute right-2 top-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteBlock(blockIndex)}
                  title="Delete File"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {block.content.fileType === 'application/pdf' ? (
              <PDFViewer 
                url={block.content.url} 
                fileName={block.content.fileName} 
              />
            ) : block.content.isImage ? (
              <ResizableImage
                src={block.content.url}
                alt={block.content.fileName}
                editable={editorMode}
                onResize={
                  editorMode
                    ? (width, height) => {
                        const newBlocks = [...contentBlocks];
                        newBlocks[blockIndex] = {
                          ...block,
                          content: {
                            ...block.content,
                            size: {
                              width: `${width}px`,
                              height: `${height}px`,
                            },
                          },
                        };
                        setContentBlocks(newBlocks);
                        setHasUnsavedChanges(true);
                      }
                    : undefined
                }
              />
            ) : (
              <div className="flex items-center gap-2 p-4 border rounded-lg">
                <FileIcon className="h-5 w-5" />
                <span className="flex-1">{block.content.fileName}</span>
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={block.content.url} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            )}
          </div>
        );
      }
      default: {
        return null;
      }
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Only show title and save button in editor mode */}
      {editorMode && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {isLoading ? <Skeleton className="h-8 w-64" /> : concept?.title}
              </h1>
            </div>
            <Button
              onClick={() => saveMutation.mutate(concept?.content)}
              className="flex items-center gap-2"
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* First video block - only show in editor mode */}
          {editorMode && !skipFirstVideo && (
            <>
              {contentBlocks
                .filter(block => block.type === "video")
                .slice(0, 1)
                .map((block, idx) => (
                  <div key={block.id} className="relative group">
                    {renderBlock(block, contentBlocks.indexOf(block))}
                  </div>
                ))}
            </>
          )}
          
          {/* Rest of the content blocks */}
          {contentBlocks
            .filter((block, index) => {
              // Skip first video in viewer mode if skipFirstVideo is true
              if (block.type === "video" && 
                  contentBlocks.findIndex(b => b.type === "video") === index &&
                  skipFirstVideo) {
                return false;
              }
              // Skip first video in editor mode if already shown above
              if (editorMode && block.type === "video" && 
                  contentBlocks.findIndex(b => b.type === "video") === index) {
                return false;
              }
              return true;
            })
            .map((block, index) => (
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
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Edit {block.type}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {block.type === "embed" ? (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>HTML Code</Label>
                                  <Textarea
                                    value={block.content.html}
                                    onChange={(e) =>
                                      handleEditEmbed(index, e.target.value)
                                    }
                                    placeholder="Enter HTML embed code..."
                                    className="font-mono min-h-[200px]"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Preview</Label>
                                  <div className="border rounded-lg p-4 bg-background">
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: block.content.html,
                                      }}
                                      className="w-full"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
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
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteBlock(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                )}

                {renderBlock(block, index)}
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
                  <CustomVideoPlayer
                    url={videoUrl}
                    thumbnailUrl=""
                  />
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

          <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Code2 className="h-5 w-5" />
                Insert Embed
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Insert HTML Embed</DialogTitle>
                <DialogDescription>
                  Add any HTML embed code including iframes, widgets, or other
                  embeddable content. Scripts will be automatically handled.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>HTML Code</Label>
                  <Textarea
                    value={embedCode}
                    onChange={(e) => {
                      setEmbedCode(e.target.value);
                      setEmbedPreview(e.target.value);
                    }}
                    placeholder="Paste your HTML embed code here..."
                    className="font-mono min-h-[100px]"
                  />
                </div>
                {embedPreview && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="border rounded-lg p-4 bg-background">
                      <div
                        dangerouslySetInnerHTML={{ __html: embedPreview }}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEmbedCode("");
                      setEmbedPreview("");
                      setShowEmbedDialog(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddEmbed}
                    disabled={!embedCode.trim()}
                  >
                    Add Embed
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <FileUploadButton 
            onUploadComplete={(url, fileName, fileType) => {
              const newBlock = {
                id: `file-${Date.now()}`,
                type: "file",
                order: contentBlocks.length,
                content: {
                  url,
                  fileName,
                  fileType,
                  isImage: fileType.startsWith('image/'),
                },
              };
              setContentBlocks([...contentBlocks, newBlock]);
              setHasUnsavedChanges(true);
              toast.success("File added to content");
            }} 
          />
        </div>
      )}

      {/* Add bottom padding to prevent content from being hidden behind buttons */}
      <div className="h-32" />
    </div>
  );
}
