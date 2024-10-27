"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import * as Y from "yjs";
import { useTheme } from "next-themes";
import { Toast } from "@/components/ui/toast";

interface BlockNoteEditorProps {
  conceptId: string;
  sectionId: string;
  courseId: string;
  initialContent?: string | PartialBlock[];
}

export function BlockNoteEditorComponent({
  initialContent,
  conceptId,
  sectionId,
  courseId,
}: {
  initialContent: PartialBlock[];
  conceptId: string;
  sectionId: string;
  courseId: string;
}) {
  const { resolvedTheme } = useTheme();
  const [showSaveToast, setShowSaveToast] = useState(false);
  const editorRef = useRef<BlockNoteEditor | null>(null);

  const editor = useCreateBlockNote({
    initialContent: initialContent,
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const saveContent = useCallback(async () => {
    if (!editorRef.current) return;
    const content = editorRef.current.topLevelBlocks;
    try {
      const response = await fetch(`/api/concepts/${conceptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      if (response.ok) {
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 2000); // Hide toast after 2 seconds
      } else {
        console.error("Failed to save content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
    }
  }, [conceptId]);

  useEffect(() => {
    let saveTimeout: NodeJS.Timeout;

    const handleChange = () => {
      if (!editorRef.current) return;
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveContent, 1000); // Save after 1 second of inactivity
    };

    if (editorRef.current) {
      editorRef.current.onEditorContentChange(handleChange);
    }

    return () => {
      clearTimeout(saveTimeout);
      if (editorRef.current) {
        editorRef.current.onEditorContentChange(() => {});
      }
    };
  }, [saveContent]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="h-full relative">
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
      {showSaveToast && (
        <div className="absolute bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded">
          Content saved!
        </div>
      )}
    </div>
  );
}

function BlockNote({
  doc,
  theme,
  initialContent,
  conceptId,
  sectionId,
  courseId,
}: {
  doc: Y.Doc;
  theme: string | undefined;
  initialContent: PartialBlock[];
  conceptId: string;
  sectionId: string;
  courseId: string;
}) {
  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent,
    collaboration: {
      provider: null,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: "User",
        color: "#000000",
      },
    },
  });

  useEffect(() => {
    const saveContent = async () => {
      const content = editor.topLevelBlocks;
      await fetch(`/api/concepts/${conceptId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
    };

    const debounce = setTimeout(saveContent, 1000);

    return () => clearTimeout(debounce);
  }, [editor.topLevelBlocks, conceptId]);

  return (
    <BlockNoteView
      editor={editor}
      theme={theme === "dark" ? "dark" : "light"}
    />
  );
}
