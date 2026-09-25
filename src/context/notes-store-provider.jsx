"use client";

import { createNotesStore } from "@/store/notes-store";
import { useState } from "react";
import { NotesStoreContext } from "./notes-store-context";

export default function NotesStoreProvider({ children, initialValue }) {
  const [store] = useState(() => createNotesStore(initialValue));

  return (
    <NotesStoreContext.Provider value={store}>
      {children}
    </NotesStoreContext.Provider>
  );
}
