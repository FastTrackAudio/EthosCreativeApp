"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { BlockNoteEditor, PartialBlock } from "@blocknote/core"
import "@blocknote/core/fonts/inter.css"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"
import { useTheme } from "next-themes"

interface BlockNoteEditorProps {
  conceptId: string
  initialContent: string | null
  onUpdate?: (content: string) => void
  isTransparent?: boolean
}

const defaultBlock: PartialBlock[] = [
  {
    type: "paragraph",
    content: "Start writing here...",
  },
]

export function BlockNoteEditorComponent({
  conceptId,
  initialContent,
  onUpdate,
  isTransparent,
}: BlockNoteEditorProps) {
  const { resolvedTheme } = useTheme()
  const editorRef = useRef<BlockNoteEditor | null>(null)

  // Parse initial content or use default
  const parsedContent = useMemo(() => {
    if (!initialContent) return defaultBlock

    try {
      if (
        typeof initialContent === "string" &&
        initialContent.startsWith("[")
      ) {
        const parsed = JSON.parse(initialContent)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }

      return [
        {
          type: "paragraph",
          content: initialContent,
        },
      ]
    } catch {
      return [
        {
          type: "paragraph",
          content: initialContent,
        },
      ]
    }
  }, [initialContent])

  const editor = useCreateBlockNote({
    initialContent: parsedContent,
  })

  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  // Content change handler without auto-save
  useEffect(() => {
    const handleChange = () => {
      if (!editorRef.current || !onUpdate) return
      const content = JSON.stringify(editorRef.current.topLevelBlocks)
      onUpdate(content)
    }

    editor.onEditorContentChange(handleChange)

    return () => {
      editor.onEditorContentChange(() => {})
    }
  }, [editor, onUpdate])

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <div className="h-full relative">
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        className={isTransparent ? "bg-transparent" : ""}
        data-transparent={isTransparent}
      />
    </div>
  )
}
