import { queryClient } from "./client";

export function removeFromCache(key, id) {
  queryClient.setQueryData(key, (prev) => {
    if (!prev) return prev;
    return {
      ...prev,
      pages: prev.pages.map(page => ({
        ...page,
        notes: page.notes.filter(n => n.id !== id)
      }))
    }
  });
}

export function shiftTo(key, data) {
  queryClient.setQueryData(key, (prev) => {
    if (!prev) return prev;
    return {
      ...prev,
      pages: prev.pages.map(page => ({
        ...page,
        notes: [data, ...page.notes]
      }))
    }
  });
}
