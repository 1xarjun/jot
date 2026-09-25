"use client";

import { createStore } from "zustand/vanilla";
import { update, create as createNote, remove, revokeAccess, share } from "@/app/actions/notes";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export const initialState = {
  notes: [],
  shared: [],
  focusingNote: null,
  shareDialogIsOpen: false,
  searchOpen: false,
  selectedNoteForSharing: null
};

export const createNotesStore = (defaultState = {}) => {
  return createStore()((set, get) => ({
    ...initialState,
    ...defaultState,
    actions: {
      reset: () => {
        const { actions } = get();
        set({ ...initialState, actions });
      },
      updateNotes: (newNotesArray) => {
        set({ notes: newNotesArray });
      },

      focusNote: (note) => {
        set({ focusingNote: note });
      },

      unfocusNote: () => {
        set({ focusingNote: null });
      },

      saveNote: async (note) => {
        if (!note.title) return toast.error("Title is required");
        set((state) => ({ notes: [...state.notes, note] }));

        const supabase = createClient();

        const {
          data: {
            session,
          },
        } = await supabase.auth.getSession();

        if (!session?.user) return;

        const { data, success, message } = await createNote({
          title: note.title,
          content: note.content
        });

        if (!success) {
          set((state) => ({
            notes: state.notes.filter((n) => n.id !== note.id),
          }));
          toast.error(message);
        } else {
          set((state) => ({
            notes: state.notes.map((n) => (n.id === note.id ? data : n)),
          }));
        }
      },

      editNote: async (id, data) => {
        const { notes } = get();
        const note = notes.find((n) => n.id === id);
        set({ notes: notes.map((n) => (id === n.id ? { ...n, ...data, updated_at: new Date().toISOString() } : n)) });

        const supabase = createClient();
        const {
          data: {
            session,
          },
        } = await supabase.auth.getSession();

        if (!session?.user) return;

        const { success, message } = await update(id, data);

        if (!success) {
          set({ notes: notes.map((n) => (n.id === id ? note : n)) });
          toast.error(message);
        }
      },

      deleteNote: async (id) => {
        const { notes } = get();

        const note = notes.find((n) => n.id === id);

        set({
          notes: notes.filter((note) => note.id !== id),
        });

        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) return;

        const { success, message } = await remove(id);

        if (!success) {
          set({ notes: [...notes, note] });
          toast.error(message);
        }
      },

      setShareDialogIsOpen: (open) => {
        set({ shareDialogIsOpen: typeof open === "boolean" ? open : false });
      },

      setSearchOpen: (open) => {
        set({ searchOpen: typeof open === "boolean" ? open : false });
      },

      setSelectedNoteForSharing: (note) => {
        set({ selectedNoteForSharing: note })
      },

      revoke: async (token) => {
        if (!token) return console.error("Invalid request");
        const { success, message } = await revokeAccess(token);

        if (!success) {
          return toast.error(message)
        } else {
          toast.success("Access revoked successfully")
          set((state) => ({ shared: state.shared.filter(s => s.token !== token )}))
        }
      },

      shareIt: async (note_id, expired_at) => {
        if(!note_id || !expired_at) return console.error("Invalid request")
        const { success, message, data } = await share({ note_id, expired_at })
        if (!success) {
          return toast.error(message)
        } else {
          toast.success("Note shared successfully")
          set((state) => ({ shared: [...state.shared, data] }));
        }
      }
    },
  }));
};
