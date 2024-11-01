"use client"

import { useEffect, useRef, useMemo } from "react"
import { BlockNoteEditor, PartialBlock } from "@blocknote/core"
import "@blocknote/core/fonts/inter.css"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface BlockNoteEditorComponentProps {
  conceptId: string
  initialContent: string | null
  onUpdate?: (content: string) => void
  isTransparent?: boolean
  editorMode?: boolean
}

export function BlockNoteEditorComponent({
  initialContent,
  onUpdate,
  isTransparent,
  editorMode = true,
}: BlockNoteEditorComponentProps) {
  const { resolvedTheme } = useTheme()
  const editorRef = useRef<BlockNoteEditor | null>(null)

  // Parse the initial content with default empty block
  const parsedContent = useMemo(() => {
    try {
      if (!initialContent) {
        return [
          {
            id: "1",
            type: "paragraph",
            content: [],
            props: {
              textColor: "default",
              backgroundColor: "default",
              textAlignment: "left",
            },
          },
        ]
      }

      const content =
        typeof initialContent === "string"
          ? JSON.parse(initialContent)
          : initialContent

      // If content is empty or invalid, return default block
      if (!Array.isArray(content) || content.length === 0) {
        return [
          {
            id: "1",
            type: "paragraph",
            content: [],
            props: {
              textColor: "default",
              backgroundColor: "default",
              textAlignment: "left",
            },
          },
        ]
      }

      return content
    } catch (error) {
      console.error("Error parsing content:", error)
      // Return default block on error
      return [
        {
          id: "1",
          type: "paragraph",
          content: [],
          props: {
            textColor: "default",
            backgroundColor: "default",
            textAlignment: "left",
          },
        },
      ]
    }
  }, [initialContent])

  // Create editor with appropriate configuration
  const editor = useCreateBlockNote({
    initialContent: parsedContent,
    domAttributes: {
      editor: {
        class: cn(
          "p-4",
          isTransparent && "bg-transparent [&_.bn-container]:bg-transparent"
        ),
      },
    },
    // Configure editor features based on mode
    sideMenu: editorMode, // Only show side menu in editor mode
    slashMenu: editorMode, // Only show slash menu in editor mode
    defaultStyles: true,
  })

  // Set editor editability
  useEffect(() => {
    if (editor) {
      editor.isEditable = editorMode
    }
  }, [editor, editorMode])

  // Set up editor ref for saving
  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  // Handle content changes in editor mode
  useEffect(() => {
    if (!editorRef.current || !onUpdate || !editorMode) return

    const saveContent = () => {
      const blocks = editorRef.current?.topLevelBlocks
      if (blocks) {
        onUpdate(JSON.stringify(blocks))
      }
    }

    const handleChange = () => {
      saveContent()
    }

    editor.onEditorContentChange(handleChange)

    return () => {
      editor.onEditorContentChange(() => {}) // Remove listener
    }
  }, [editor, onUpdate, editorMode])

  return (
    <div
      className={cn(
        "rounded-lg border bg-background",
        isTransparent && "border-none bg-transparent"
      )}
    >
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    </div>
  )
}
