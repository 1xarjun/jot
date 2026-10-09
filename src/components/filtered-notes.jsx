"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronRight, Ellipsis, Loader } from "lucide-react";
import Note from "./note";
import { ShowEmpty } from "./constants";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import { useCurrentEditor } from "@tiptap/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchNotes } from "@/app/actions/notes";
import { toast } from "sonner";
import NotesSkeleton from "./skeletons/notes-skeleton";

export default function FilteredNotes() {
  const { id } = useParams();
  const { debouncedEdit } = useCurrentEditor();
  const [showNotes, setShowNotes] = useState(true);

  const { data, isLoading, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage, error } = useInfiniteQuery({
    queryKey: ["filtered_notes"],
    queryFn: async ({ pageParam: cursor }) => {
      const { success, message, data } = await fetchNotes(cursor);
      if (!success) throw new Error(message)
      return data;
    },
    initialPageParam: null,
    getNextPageParam: (prevResponse) => prevResponse?.cursor
  })

  useEffect(() => {
    if(isFetchNextPageError) toast.error(error.message)
  }, [isFetchNextPageError])

  // flattens the notes => notes array of each page is grabbed and joined
  const notes = data?.pages.flatMap(page => page.notes)

  if(isLoading) return <NotesSkeleton />

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
                    `w-full px-2.5 group/item ${id === note.id ? "bg-accent dark:bg-accent/50" : ""} gap-0.5 font-normal`,
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
  );
}
//
// {isFetchingNextPage ? (
//   <span className="w-full flex items-center gap-2.5">
//     <Loader className="animate-spin" />
//     {"Loading more..."}
//   </span>
// ) : (
