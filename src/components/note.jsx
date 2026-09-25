"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Share,
  Pin,
  PinOff,
} from "lucide-react";
import { useRef } from "react";
import { useState } from "react";
import { useNotesStore } from "@/context/notes-store-context";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";

export default function Note({ note }) {
  const noteRef = useRef(null);

  const {
    deleteNote,
    setShareDialogIsOpen,
    editNote,
    setSelectedNoteForSharing
  } = useNotesStore((s) => s.actions);

  const [editing, setEditing] = useState(false);
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const { id: focusingNoteId } = useParams();
  const { user } = useAuth();

  const handleDelete = (note) => {
    deleteNote(note.id);
    if (focusingNoteId === note.id) router.replace("/");
  };

  const handleRename = (e) => {
    e.stopPropagation();
    const $ = noteRef.current;
    if ($) {
      setEditing(true);
      setTimeout(() => {
        $.focus({ focusVisible: true });
        $.select();
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === "Enter" || e.key === "Escape") {
      if (title.trim() === "") {
        setEditing(false);
        return setTitle(note.title);
      }
      setEditing(false);
      editNote(note.id, { title });
    }
  };

  const handleBlur = () => {
    if (title.trim() === "") {
      setEditing(false);
      return setTitle(note.title);
    }
    setEditing(false);
   editNote(note.id, { title });
  };

  return (
    <>
      <input
        required
        maxLength={50}
        ref={noteRef}
        hidden={!editing}
        type="text"
        value={title}
        onClick={(e) => e.preventDefault()}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="outline-none"
      />
      <span hidden={editing} className="truncate flex-1 pointer-events-none">
        {title}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger
        className="md:opacity-0 md:group-hover/item:opacity-100 md:group-focus-visible/item:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100"
        render={
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={(e) => e.preventDefault()}
            >
              <MoreVertical />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                editNote(note.id, { pinned: !note.pinned });
              }}
            >
              {note.pinned ? (
                <>
                  <PinOff /> Unpin
                </>
              ) : (
                <>
                  <Pin /> Pin
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!user}
              onClick={(e) => {
                e.stopPropagation() // stop invoking parent
                setSelectedNoteForSharing(note)
                setShareDialogIsOpen(true)
              }}>
              <Share /> Share
            </DropdownMenuItem>

            <DropdownMenuItem role="button" onClick={handleRename}>
              <Edit2 /> Rename
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(note);
              }}
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
