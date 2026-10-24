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
  Share,
  Pin,
  PinOff,
} from "lucide-react";
import { useRef } from "react";
import { useState } from "react";
import { useNotesStore } from "@/context/notes-store-context";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useMutation } from "@tanstack/react-query";
import { remove, update } from "@/app/actions/notes";
import { queryClient } from "@/query/client";
import { toast } from "sonner";
import { removeFromCache, shiftTo } from "@/query/helper";

export default function Note({ note }) {
  const noteRef = useRef(null);
  const { setShareDialogIsOpen, setSelectedNoteForSharing, editNote, deleteNote } = useNotesStore(
    (s) => s.actions,
  );

  const [editing, setEditing] = useState(false);
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const { id: focusingNoteId } = useParams();
  const { user } = useAuth();

  const deleteMutation = useMutation({
    mutationFn: async ({ id }) => {
      if (!user) {
        deleteNote(id);
        return;
      }
      const { success, message } = await remove(id);
      if (!success) throw new Error(message);
    },

    onSuccess: (_, variables) => {
      if (focusingNoteId === variables.id) router.replace("/");
      // this is safe to run even if the cache doesn't exist
      queryClient.removeQueries({ queryKey: ["note", variables.id], exact: true });
      removeFromCache(["filtered_notes"], variables.id);
      removeFromCache(["pinned_notes"], variables.id);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      if (!user) {
        editNote(id, data);
        return { ...note, ...data, updated_at: new Date().toISOString() };
      }
      const { success, message, data: $ } = await update(id, data);
      if (!success) throw new Error(message);
      return $;
    },

    onSuccess: (updatedNote, variables) => {
      queryClient.setQueryData(["note", variables.id], (prev) => ({
        ...prev,
        ...updatedNote,
      }));
      removeFromCache(['filtered_notes'], variables.id);
      removeFromCache(['pinned_notes'], variables.id);
      updatedNote?.pinned ? shiftTo(['pinned_notes'], updatedNote) : shiftTo(['filtered_notes'], updatedNote);
    },

    onError: (error) => toast.error(error.message),
  });

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
      updateMutation.mutate({ id: note.id, data: { title } });
    }
  };

  const handleBlur = () => {
    if (title.trim() === "") {
      setEditing(false);
      return setTitle(note.title);
    }
    setEditing(false);
    updateMutation.mutate({ id: note.id, data: { title } });
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
                // fix this mutation, currently the update is showing only after a full-refresh
                updateMutation.mutate({
                  id: note.id,
                  data: { pinned: !note.pinned },
                });
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
                e.stopPropagation(); // stop invoking parent
                setSelectedNoteForSharing(note);
                setShareDialogIsOpen(true);
              }}
            >
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
                deleteMutation.mutate({ id: note.id });
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

// if (!note?.pinned) {
//   if (updatedNote?.pinned) {
//     // shift this note to pinned
//     const note = queryClient
//       .getQueryData(["filtered_notes"])?.pages.flatMap(page => page.notes)
//       .find((n) => n.id === variables.id);
//
//     if (note) {
//       queryClient.setQueryData(["filtered_notes"], (prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           pages: prev.pages.map((page) => ({
//             ...page,
//             notes: page.notes.filter((n) => n.id !== note.id),
//           })),
//         };
//       });
//
//       queryClient.setQueryData(["pinned_notes"], (prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           pages: prev.pages.map((page) => ({
//             ...page,
//             notes: [...page.notes, {...note, ...updatedNote}],
//           })),
//         };
//       });
//     }
//   } else {
//     queryClient.setQueryData(["filtered_notes"], (prev) => {
//       if (!prev) return prev;
//       return {
//         ...prev,
//         pages: prev.pages.map((page) => ({
//           ...page,
//           notes: page.notes.map((note) =>
//             note.id === variables.id ? { ...note, ...updatedNote } : note,
//           ),
//         })),
//       };
//     });
//   }
// } else {
//   if (!updatedNote?.pinned) {
//     // shift this note to filtered
//     const note = queryClient
//       .getQueryData(["pinned_notes"])?.pages.flatMap(page => page.notes)
//       .find((n) => n.id === variables.id);
//
//     if (note) {
//       // filter out from the pinned and add it to the filtered
//       queryClient.setQueryData(["pinned_notes"], (prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           pages: prev.pages.map((page) => ({
//             ...page,
//             notes: page.notes.filter((n) => n.id !== variables.id),
//           })),
//         };
//       });
//
//       queryClient.setQueryData(["filtered_notes"], (prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           pages: prev.pages.map((page) => ({
//             ...page,
//             notes: [...page.notes, { ...note, ...updatedNote }],
//           })),
//         };
//       });
//     }
//   } else {
//     queryClient.setQueryData(["pinned_notes"], (prev) => {
//       if (!prev) return prev;
//       return {
//         ...prev,
//         pages: prev.pages.map((page) => ({
//           ...page,
//           notes: page.notes.map((note) =>
//             note.id === variables.id ? { ...note, ...updatedNote } : note,
//           ),
//         })),
//       };
//     });
//   }
// }
