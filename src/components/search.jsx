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
import { searchNotes } from "@/app/actions/notes";
import { useCurrentEditor } from "@tiptap/react";
import { useQuery } from "@tanstack/react-query";
import { Dot, NotepadText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { queryClient } from "@/query/client";
import { useAuth } from "@/context/AuthProvider";

export default function Search() {
  const router = useRouter();
  const { debouncedEdit } = useCurrentEditor();
  const open = useNotesStore((s) => s.searchOpen ?? false);
  const setOpen = useNotesStore((s) => s.actions.setSearchOpen);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { user } = useAuth();
  const zNotes = useNotesStore((s) => s.notes);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const {
    data: serverSearchResult,
    isFetching: isSearching,
    isError: searchError,
  } = useQuery({
    queryKey: ["note-search", debouncedSearch.trim()],
    queryFn: () => {
      if (!user) {
	const result = zNotes.filter(z => z.title.toLowerCase().includes(debouncedSearch.toLowerCase())).sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0,5);
	return { success: true, data: result ?? [] }; 
      }
      return searchNotes(debouncedSearch);
    },
    enabled: Boolean(debouncedSearch.trim()),
  });

  const filteredNotesQuery = queryClient.getQueryData(["filtered_notes"]);

  const searchItems = useMemo(() => {
    const filteredNotes = filteredNotesQuery?.pages?.flatMap((page) => page.notes || []) || [];

    if (!search.trim())
      return [...filteredNotes]
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5);

    return serverSearchResult?.success ? serverSearchResult.data || [] : [];
  }, [search, filteredNotesQuery, serverSearchResult]);

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
          <CommandEmpty>
            {isSearching ? "Searching..." : searchError ? "Unable to search notes." : "No notes found."}
          </CommandEmpty>
          {searchItems.length > 0 && (
            <CommandGroup heading={search.trim() ? "Results" : "Recent Notes"}>
              {searchItems.map((note) => (
                <CommandItem
                  key={note.id}
                  value={`${note.title} ${note.id}`}
                  onSelect={() => handleSelect(note.id)}
                >
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
