"use client";

import Link from "next/link";
import Note from "./note";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Ellipsis, Loader } from "lucide-react";
import { useCurrentEditor } from "@tiptap/react";
import { useParams } from "next/navigation";
import { fetchPinnedNotes } from "@/app/actions/notes";
import { useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import NotesSkeleton from "./skeletons/notes-skeleton";
import { useNotesStore } from "@/context/notes-store-context";
import { createClient } from "@/utils/supabase/client";

export default function PinnedNotes() {
  const { id } = useParams();
  const { debouncedEdit } = useCurrentEditor();
  const [showPinned, setShowPinned] = useState(true);
  const zNotes = useNotesStore((s) => s.notes);

  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["pinned_notes"],
    queryFn: async ({ pageParam: cursor }) => {
	const supabase = createClient();
	const { data: { session} } = await supabase.auth.getSession();
	if (!session?.user) {
        const pinned = zNotes.filter((z) => z.pinned);
        return { notes: pinned, cursor: null };
      }
      const { success, message, data } = await fetchPinnedNotes(cursor);
      if (!success) throw new Error(message);
      return data;
    },
    initialPageParam: null,
    getNextPageParam: (prevResponse) => prevResponse?.cursor,
  });

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  if (isLoading) return <NotesSkeleton />;

  // flattens the notes => notes array of each page is grabbed and joined
  const notes = data?.pages.flatMap((page) => page.notes);

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
              showPinned
                ? "opacity-0 group-hover/pinned:opacity-100 group-focus-visible/button:opacity-100"
                : "opacity-100",
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
          {notes?.map((note) => (
            <Link
              key={note.id}
              onClick={() => debouncedEdit.flush()}

              href={`/n/${note.id}`}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                `w-full px-2.5 group/item ${
                  id === note.id ? "bg-accent dark:bg-accent/50" : ""
                } gap-0.5 font-normal`,
              )}
            >
              <Note note={note} />
            </Link>
          ))}

          {hasNextPage && !isFetchingNextPage && (
            <Button
              onClick={() => fetchNextPage()}
              variant="ghost"
              className="justify-start text-muted-foreground/70 hover:text-muted-foreground font-light"
              disabled={!!isFetchingNextPage}
            >
              <Ellipsis />
              Load more
            </Button>
          )}

          {isFetchingNextPage && <NotesSkeleton />}
        </div>
      )}
    </div>
  ) : null;
}
