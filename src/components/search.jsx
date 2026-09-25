"use client";

import {
  CommandDialog,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

import { useNotesStore } from "@/context/notes-store-context";
import { useCurrentEditor } from "@tiptap/react";
import { NotepadText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function Search() {
  const router = useRouter();
  const { debouncedEdit } = useCurrentEditor();
  const open = useNotesStore((s) => s.searchOpen ?? false);
  const setOpen = useNotesStore((s) => s.actions.setSearchOpen);
  const notes = useNotesStore((s) => s.notes);
  const [search, setSearch] = useState("");

  const searchItems = useMemo(() => {
    if (!search)
      return [...(notes || [])]
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 6);

    return [...(notes || [])]
      .filter((note) => note.title.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 6);
  }, [search, notes]);

  const handleSelect = (noteId) => {
    debouncedEdit?.flush();
    setOpen(false);
    router.push(`/n/${noteId}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search notes..."
        />
        <CommandList>
          <CommandEmpty>No notes found.</CommandEmpty>
          {notes.length > 0 && (
            <CommandGroup heading={search.trim() ? undefined : "Recent Notes"}>
              {searchItems.map((note) => (
                <CommandItem
                  key={note.id}
                  value={`${note.title} ${note.id}`}
                  onSelect={() => handleSelect(note.id)}
                >
                  <NotepadText />
                  {note.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
