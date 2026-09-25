"use client";

import { useNotesStore } from "./notes-store-context";
import { debounce } from "@/utils/helper";
import { useEditor } from "@tiptap/react";
import { EditorContext } from "@tiptap/react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { StarterKit, Placeholder, TextAlign } from "@/utils/extensions";

export default function EditorProvider({ children }) {
  const { id: focusingNoteId } = useParams();
  const { editNote } = useNotesStore(s => s.actions);

  const debouncedEdit = useMemo(
    () =>
      debounce(
        (noteId, editor) => editNote(noteId, { content: editor.getJSON() }),
        700,
      ),
    [editNote],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Type here to get started...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    onUpdate: ({ editor }) => {
      if (!focusingNoteId) return;
      debouncedEdit(focusingNoteId, editor);
    },
    immediatelyRender: false,
  });

  const provider = useMemo(() => ({ editor }), [editor]);
  provider.debouncedEdit = debouncedEdit;

  return (
    <EditorContext.Provider value={provider}>
      {children}
    </EditorContext.Provider>
  );
}
