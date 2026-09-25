"use client";

import { EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import EditorWrapperHeader from "./EditorWrapperHeader";
import EditorToolbar from "./EditorToolbar";
import { useCurrentEditor } from "@tiptap/react";
import { SidebarTrigger } from "./ui/sidebar";
import { Menu } from "lucide-react";
import { useNotesStore } from "@/context/notes-store-context";
import { useRouter } from "next/navigation";

export default function EditorWrapper({ id = undefined, sharedCopy = undefined }) {
  const { editor } = useCurrentEditor();
  const { notes } = useNotesStore((state) => state);
  const note = notes?.find((note) => note.id === id);
  const router = useRouter();

  useEffect(() => {
    if (!editor) return;
    if (note || sharedCopy) {
      editor?.commands.setContent(note?.content ?? sharedCopy?.content, { emitUpdate: false });
    } else {
      if (id && !note) router.replace("/");
      editor?.commands.setContent(undefined, { emitUpdate: false });
    }
  }, [editor, id, sharedCopy]);


  return (
    <div className="w-full h-dvh overflow-hidden">
      <div className="overflow-y-auto w-full h-full lg:pt-14">
        <div className="lg:hidden sticky top-0 z-30 shadow-xs border-b p-2 flex items-center bg-background h-12">
          <SidebarTrigger icon={<Menu />} />
        </div>

        <EditorWrapperHeader focusingNote={note ?? sharedCopy} isShared={!!sharedCopy} />
        <EditorContent
          readOnly={!!sharedCopy}
          editor={editor}
          className="prose dark:prose-invert max-w-full sm:max-w-xl md:max-w-2xl xl:max-w-3xl mx-auto prose-h1:text-3xl prose-h1:font-bold my-5 md:my-8 px-8 md:px-0 min-h-[calc(100vh-200px)] [&_li>p]:my-0 [&_li]:my-0 [&_p:has(+_ul)]:my-0 [&_p:has(+_ol)]:my-0 [&_:is(ul,ol)]:mt-1.5 [&_:is(ul,ol)]:mb-4 text-foreground"
        />

        {!sharedCopy && (
          <div className="w-full sticky bottom-0 sm:pb-6">
            <EditorToolbar editor={editor} />
          </div>
        )}
      </div>
    </div>
  );
}
