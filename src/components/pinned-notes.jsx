"use client";

import Link from "next/link";
import Note from "./note";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useCurrentEditor } from "@tiptap/react";
import { useParams } from "next/navigation";
import { useNotesStore } from "@/context/notes-store-context";

export default function PinnedNotes() {
  const { id } = useParams();
  const { debouncedEdit } = useCurrentEditor();
  const { notes: allNotes } = useNotesStore(s=> s);
  const notes = allNotes?.filter((note) => note.pinned);
  const [showPinned, setShowPinned] = useState(true);

  return notes?.length > 0 ? (
    <div className="group/pinned">
      <button
        onClick={() => setShowPinned(!showPinned)}
        className="group/button w-full flex items-start px-2.5 font-semibold"
      >
        <span className="flex items-center gap-0.5 text-muted-foreground">
          Pinned
          <span
            className={cn(
              "transition-opacity",
              showPinned ? "opacity-0 group-hover/pinned:opacity-100 group-focus-visible/button:opacity-100" : "opacity-100"
            )}
          >
            {showPinned ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
          </span>
        </span>
      </button>
      {showPinned && (
        <div className="mt-1.5 flex flex-col gap-0.5">
          {notes.map((note) => (
            <Link
              key={note.id}
              onClick={() => debouncedEdit.flush()}

              href={`/n/${note.id}`}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                `w-full px-2.5 group/item ${
                  id === note.id
                    ? "bg-accent dark:bg-accent/50 font-extrabold"
                    : ""
                } gap-0.5 font-normal`,
              )}
            >
              <Note note={note} />
            </Link>
          ))}
        </div>
      )}
    </div>
  ) : null;
}
