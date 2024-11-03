"use client"

import { BlockNoteEditor, PartialBlock } from "@blocknote/core"
import { BlockNoteViewRaw, useBlockNote } from "@blocknote/react"
import "@blocknote/core/style.css"

interface BlockNoteProps {
  initialContent?: string
  onChange?: (content: string) => void
  editable?: boolean
}

export function BlockNote({
  initialContent,
  onChange,
  editable = true,
}: BlockNoteProps) {
  const editor: BlockNoteEditor = useBlockNote({
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
  })

  return (
    <div className="[&_.bn-container]:p-0 [&_.bn-editor]:min-h-0">
      <BlockNoteViewRaw
        editor={editor}
        theme="light"
        editable={editable}
        onChange={() => {
          onChange?.(JSON.stringify(editor.topLevelBlocks, null, 2))
        }}
      />
    </div>
  )
}
