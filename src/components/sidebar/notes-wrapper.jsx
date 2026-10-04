"use client";

import FilteredNotes from "../filtered-notes";
import PinnedNotes from "../pinned-notes";
import { use, useState, useLayoutEffect } from "react";
import { useNotesStore } from "@/context/notes-store-context";

export default function NotesWrapper({ promise }) {
  const [{ data: notes }, { data: shared }] = use(promise);
  const [ready, setReady] = useState(false);

  const updateNotes = useNotesStore((s) => s.actions.updateNotes);
  const updateShared = useNotesStore((s) => s.actions.updateShared);

  // it's a hack but it works since it runs before the browser paints
  useLayoutEffect(() => {
    updateNotes(notes ?? []);
    updateShared(shared ?? []);
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <>
      <PinnedNotes />
      <FilteredNotes />
    </>
  );
}
