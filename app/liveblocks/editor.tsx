import { useEffect, useState } from "react";
import { BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import * as Y from "yjs";

type EditorProps = {
  doc: Y.Doc;
};

function Editor() {
  const [doc, setDoc] = useState<Y.Doc>();

  // Set up Liveblocks Yjs provider
  useEffect(() => {
    const yDoc = new Y.Doc();
    setDoc(yDoc);

    return () => {
      yDoc?.destroy();
    };
  }, []);

  if (!doc) {
    return null;
  }

  return <BlockNote doc={doc} />;
}

function BlockNote({ doc }: EditorProps) {
  const editor: BlockNoteEditor = useCreateBlockNote({
    collaboration: {
      provider: null,

      // Where to store BlockNote data in the Y.Doc:
      fragment: doc.getXmlFragment("document-store"),

      // Information for this user:
      user: {
        name: "My Username",
        color: "#ff0000",
      },
    },
  });

  return <BlockNoteView editor={editor} />;
}
export default Editor;
