"use client";

import { createContext, useContext } from "react";
import { useStore } from "zustand";

export const NotesStoreContext = createContext(undefined);

export const useNotesStore = (selector) => {
  const ctx = useContext(NotesStoreContext);
  if (!ctx) throw new Error("NotesStoreProvider not found");
  return useStore(ctx, selector);
};
