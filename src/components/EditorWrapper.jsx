"use client";

import { EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import EditorWrapperHeader from "./EditorWrapperHeader";
import EditorToolbar from "./EditorToolbar";
import { useCurrentEditor } from "@tiptap/react";
import { SidebarTrigger } from "./ui/sidebar";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getNoteById, getSharedNoteByToken } from "@/app/actions/notes";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { queryClient } from "@/query/client";
import { useNotesStore } from "@/context/notes-store-context";
import { createClient } from "@/utils/supabase/client";

export default function EditorWrapper({ id = undefined, token = undefined }) {
  const { editor } = useCurrentEditor();
  const router = useRouter();
  const { user } = useAuth();
  const zNotes = useNotesStore(s => s.notes);

  const {
    data: note,
    isLoading: noteLoading,
    error: noteError,
  } = useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
	const supabase = createClient();
	const { data: { session } } = await supabase.auth.getSession();
	if (!session?.user) {
          const note = zNotes.find(z => z.id === id);
	  if (!note) {
	    router.replace("/");
	    return {};	
	  };
	  return note;
        }
      const { success, data, message } = await getNoteById(id);
      if (!success)
        throw new Error(message ?? "Error while getting note by id");
      return data;
    },
    enabled: !!id,
    staleTime: Infinity,
  });

  const {
    data: sharedNote,
    isLoading: sharedNoteLoading,
    error: sharedNoteError,
  } = useQuery({
    queryKey: ["shared_note", token],
    queryFn: async () => {
      const { success, data, message } = await getSharedNoteByToken(token);
      if (!success)
        throw new Error(message ?? "Error while getting shared note by token");
      return data;
    },
    enabled: !!token,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (noteError || sharedNoteError) {
      toast.error(
        noteError.message ??
          sharedNoteError.message ??
          "Error while getting note or shared note",
      );
      router.replace("/");
    }
  }, [noteError, sharedNoteError]);

  useEffect(() => {
    if (!editor) return;
    if (note || sharedNote) {
      editor?.commands.setContent(note?.content ?? sharedNote?.content, {
        emitUpdate: false,
      });
      editor?.setEditable(!sharedNote, false);
    } else {
      editor?.commands.setContent(undefined, { emitUpdate: false });
      editor?.setEditable(true, false); // if in blank state
    }
  }, [editor, note, sharedNote]);

  if (noteLoading || sharedNoteLoading) {
    return (
      <div className="border w-full h-dvh overflow-hidden flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-dvh overflow-hidden">
      <div className="overflow-y-auto w-full h-full lg:pt-14">
        <div className="lg:hidden sticky top-0 z-30 shadow-xs border-b p-2 flex items-center bg-background h-12">
          <SidebarTrigger icon={<Menu />} />
        </div>

        <EditorWrapperHeader
          focusingNote={note ?? sharedNote}
          isShared={!!sharedNote}
        />

        <EditorContent
          editor={editor}
          className="prose dark:prose-invert max-w-full sm:max-w-xl md:max-w-2xl xl:max-w-3xl mx-auto prose-h1:text-3xl prose-h1:font-bold my-5 md:my-8 px-8 md:px-0 min-h-[calc(100vh-200px)] [&_li>p]:my-0 [&_li]:my-0 [&_p:has(+_ul)]:my-0 [&_p:has(+_ol)]:my-0 [&_:is(ul,ol)]:mt-1.5 [&_:is(ul,ol)]:mb-4 text-foreground"
        />

        {!sharedNote && (
          <div className="w-full sticky bottom-0 sm:pb-6">
            <EditorToolbar editor={editor} />
          </div>
        )}
      </div>
    </div>
  );
}
