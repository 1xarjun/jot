"use client";

import FilteredNotes from "../filtered-notes";
import PinnedNotes from "../pinned-notes";
import { use, useLayoutEffect } from "react";
import { useNotesStore } from "@/context/notes-store-context";

export default function NotesWrapper({ promise }) {
  const [{ data: notes }, { data: shared }] = use(promise);
  const ready = useNotesStore((s) => s.ready);
  const updateNotes = useNotesStore((s) => s.actions.updateNotes);
  const updateShared = useNotesStore((s) => s.actions.updateShared);
  const setReady = useNotesStore((s) => s.actions.setReady);

  useLayoutEffect(() => {
    updateNotes(notes ?? []);
    updateShared(shared ?? []);
    setReady(true);
  }, [notes, shared, updateNotes, updateShared, setReady]);

  if(!ready) return null;

  return (
    <>
      <PinnedNotes />
      <FilteredNotes />
    </>
  );
}
