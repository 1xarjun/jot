"use client";

import { create } from "zustand";

export const useNotes = create(
        (set) => ({
            notes: [],
            focusingNote: null,
            actions: {
                updateNotes: (newNotesArray) => {
                    set({ notes: newNotesArray });
                },

                focusNote: (note) => {
                    set({ focusingNote: note });
                },

                unfocusNote: () => {
                    set({ focusingNote: null });
                },

                saveNote: (note) => {
                    if(!note.id || !note.title) return;
                    set((state) => ({ notes: [...state.notes, note] }));
                },

                editNote: (id, data) => {
                    set((state) => ({
                        notes: state.notes.map(
                            (n) => (n.id === id ? { ...n, ...data } : n), // swap if n.id = id
                        ),
                    }));
                },

                deleteNote: (id) => {
                    set((state) => ({
                        notes: state.notes.filter((note) => note.id !== id),
                    }));
                },
            },
        })
);
