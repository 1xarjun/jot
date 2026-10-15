"use client";

import { debounce } from "@/utils/helper";
import { useEditor } from "@tiptap/react";
import { EditorContext } from "@tiptap/react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { StarterKit, Placeholder, TextAlign } from "@/utils/extensions";
import { useMutation } from "@tanstack/react-query";
import { update } from "@/app/actions/notes";
import { toast } from "sonner";
import { queryClient } from "@/query/client";

export default function EditorProvider({ children }) {
  const { id: focusingNoteId } = useParams();
  const { mutate: updateNote } = useMutation({
    mutationFn: async ({ id, data }) => {
      const { success, message, data: updatedNote } = await update(id, data);
      if (!success) throw new Error(message);
      return updatedNote;
    },
    // here data is what i returned in mutationFn, variables is what i passed in .mutate
    onSuccess: (updatedNote, variables) => queryClient.setQueryData(["note", variables.id], updatedNote),
    onError: (error) => toast.error(error.message)
  });

  const debouncedEdit = useMemo(
    () => debounce(
      (noteId, editor) => updateNote({ id: noteId, data: { content: editor.getJSON() }}),
        1000,
      ),
    [updateNote],
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
