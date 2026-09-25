"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import Note from "./note";
import { ShowEmpty } from "./constants";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { useCurrentEditor } from "@tiptap/react";
import { useNotesStore } from "@/context/notes-store-context";

export default function FilteredNotes() {
  const { id } = useParams();
  const { debouncedEdit } = useCurrentEditor();
  const { notes: allNotes } = useNotesStore(s=> s);
  const notes = allNotes?.filter((note) => !note.pinned);
  const [showNotes, setShowNotes] = useState(true);

  return (
    <div className="group/notes">
      <button
        onClick={() => setShowNotes(!showNotes)}
        className="w-full flex items-start px-2.5 font-semibold group/button"
      >
        <span className="flex items-center gap-0.5 text-muted-foreground">
          Notes
          <span
            className={cn(
              "transition-opacity",
              showNotes ? "opacity-0 group-hover/notes:opacity-100 group-focus-visible/button:opacity-100" : "opacity-100"
            )}
          >
            {showNotes ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
          </span>
        </span>
      </button>

      {showNotes && (
        <div className="flex flex-col gap-0.5 mt-1.5">
          {notes?.length === 0
            ? ShowEmpty
            : notes?.map((note) => (
                <Link
                  onClick={() => debouncedEdit.flush()}
                  key={note.id}
                  href={`/n/${note.id}`}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    `w-full px-2.5 group/item ${id === note.id ? "bg-accent dark:bg-accent/50 font-extrabold" : ""} gap-0.5 font-normal`,
                  )}
                >
                  <Note note={note} />
                </Link>
              ))}
        </div>
      )}
    </div>
  );
}
