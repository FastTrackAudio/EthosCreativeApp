"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { BlockNoteEditor, PartialBlock } from "@blocknote/core"
import "@blocknote/core/fonts/inter.css"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"
import { useTheme } from "next-themes"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface BlockNoteEditorProps {
  conceptId: string
  initialContent: string | null
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
}: BlockNoteEditorProps) {
  const { resolvedTheme } = useTheme()
  const [showSaveToast, setShowSaveToast] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const editorRef = useRef<BlockNoteEditor | null>(null)
  const queryClient = useQueryClient()

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

  const updateContentMutation = useMutation({
    mutationFn: async (blocks: PartialBlock[]) => {
      setIsSaving(true)
      const response = await fetch(`/api/concepts/${conceptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: blocks }),
      })
      if (!response.ok) throw new Error("Failed to save content")
      return response.json()
    },
    onSuccess: () => {
      setIsSaving(false)
      setShowSaveToast(true)
      setTimeout(() => setShowSaveToast(false), 2000)
      queryClient.invalidateQueries({ queryKey: ["concept", conceptId] })
    },
    onError: (error) => {
      setIsSaving(false)
      console.error("Failed to save content:", error)
    },
  })

  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  // Debounced save handler
  useEffect(() => {
    let saveTimeout: NodeJS.Timeout

    const handleChange = () => {
      if (!editorRef.current) return
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        updateContentMutation.mutate(editorRef.current!.topLevelBlocks)
      }, 1000)
    }

    editor.onEditorContentChange(handleChange)

    return () => {
      clearTimeout(saveTimeout)
      editor.onEditorContentChange(() => {})
    }
  }, [editor, updateContentMutation])

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <div className="h-full relative">
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
      {showSaveToast && (
        <div className="absolute bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          Content saved!
        </div>
      )}
      {isSaving && (
        <div className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
          Saving...
        </div>
      )}
    </div>
  )
}
