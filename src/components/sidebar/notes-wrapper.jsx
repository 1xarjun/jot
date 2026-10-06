"use client";

import FilteredNotes from "../filtered-notes";
import PinnedNotes from "../pinned-notes";
import { use, useLayoutEffect, useState } from "react";
import { useNotesStore } from "@/context/notes-store-context";

export default function NotesWrapper({ promise }) {
  const [{ data: notes }, { data: shared }] = use(promise);
  const [ready, setReady] = useState(false);
  const updateNotes = useNotesStore((s) => s.actions.updateNotes);
  const updateShared = useNotesStore((s) => s.actions.updateShared);

  useLayoutEffect(() => {
    updateNotes(notes ?? []);
    updateShared(shared ?? []);
    setReady(true);
  }, [notes, shared]);

  if(!ready) return null;

  return (
    <>
      <PinnedNotes />
      <FilteredNotes />
    </>
  );
}
