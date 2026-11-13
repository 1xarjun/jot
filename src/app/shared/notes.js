import "server-only";

const DEFAULT_LIMIT = 5;

/**
 * Fetches unpinned notes with cursor-based pagination.
 */
export async function fetchNotes(supabase, cursor, limit = DEFAULT_LIMIT) {
  if (!supabase) {
    return { success: false, message: "Supabase client is required" };
  }

  let query = supabase
    .from("notes")
    .select("id, title, created_at, updated_at, pinned")
    .eq("pinned", false)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`,
    );
  }

  const { error, data } = await query;

  if (error) {
    console.error("error while getting initial notes: ", error.message);
    return {
      success: false,
      message: error.message ?? "Error while getting initial notes",
    };
  }

  const hasNext = data.length > limit;
  const notes = hasNext ? data.slice(0, limit) : data;
  const lastItem = notes[notes.length - 1];

  return {
    success: true,
    data: {
      notes,
      cursor:
        hasNext && lastItem
          ? { created_at: lastItem.created_at, id: lastItem.id }
          : null,
    },
  };
}

/**
 * Searches notes by title with a substring match.
 */
export async function searchNotes(supabase, query, limit = 5) {
  if (!supabase) {
    return { success: false, message: "Supabase client is required" };
  }

  const search = query?.trim();

  if (!search) return { success: true, data: [] };

  const { data, error } = await supabase
    .from("notes")
    .select("id, title, created_at, updated_at, pinned")
    .ilike("title", `%${search}%`)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("error while searching notes: ", error.message);
    return {
      success: false,
      message: error.message ?? "Error while searching notes",
    };
  }

  return { success: true, data };
}

/**
 * Fetches pinned notes with cursor-based pagination.
 */
export async function fetchPinnedNotes(
  supabase,
  cursor,
  limit = DEFAULT_LIMIT,
) {
  if (!supabase) {
    return { success: false, message: "Supabase client is required" };
  }

  let query = supabase
    .from("notes")
    .select("id, title, created_at, updated_at, pinned")
    .eq("pinned", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`,
    );
  }

  const { error, data } = await query;

  if (error) {
    console.error("error while getting initial pinned notes: ", error.message);
    return {
      success: false,
      message: error.message ?? "Error while getting initial pinned notes",
    };
  }

  const hasNext = data.length > limit;
  const notes = hasNext ? data.slice(0, limit) : data;
  const lastNote = notes[notes.length - 1];

  return {
    success: true,
    data: {
      notes,
      cursor:
        hasNext && lastNote
          ? { created_at: lastNote.created_at, id: lastNote.id }
          : null,
    },
  };
}

/**
 * Fetches a single note by its ID.
 */
export async function getNoteById(supabase, id) {
  if (!supabase) {
    return { success: false, message: "Supabase client is required" };
  }

  const { error, data } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("error while getting note by id: ", error.message);
    return {
      success: false,
      message: error.message ?? "Error while getting note by id",
    };
  }

  return { success: true, data };
}

/**
 * Fetches all notes ordered by creation date descending.
 */
export async function fetchAll(supabase) {
  if (!supabase) {
    return { success: false, message: "Supabase client is required" };
  }

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message ?? "Failed to fetch notes");
    return { success: false, message: error.message };
  }

  return { success: true, data };
}

/**
 * Fetches all shared entries.
 */
export async function fetchShared(supabase) {
  if (!supabase) {
    return { success: false, message: "Supabase client is required" };
  }

  const { data: sharedEntries, error } = await supabase
    .from("shared")
    .select("*");

  if (error) {
    console.error(error.message ?? "Failed to fetch shared entries");
    return { success: false, message: error.message };
  }

  return { success: true, data: sharedEntries };
}

/**
 * Gets a shared entry for a note by note ID.
 */
export async function getSharedEntry(supabase, id) {
  if (!supabase) {
    return { success: false, message: "Supabase client is required" };
  }

  if (!id) return { success: false, message: "Invalid request" };

  const { data, error } = await supabase
    .from("shared")
    .select("id, expired_at, token")
    .eq("note_id", id)
    .maybeSingle();

  if (error) {
    console.error(error.message ?? "Failed to fetch shared entry");
    return { success: false, message: error.message };
  }

  return { success: true, data };
}

/**
 * Fetches a shared note using its share token via RPC.
 */
export async function getSharedNoteByToken(supabase, token) {
  if (!supabase) {
    return { success: false, message: "Supabase client is required" };
  }

  if (!token) return { success: false, message: "Invalid request" };

  const { data, error } = await supabase.rpc("get_shared_note", {
    s_token: token,
  });

  if (error) {
    console.error(error.message ?? "Failed to fetch shared note");
    return {
      success: false,
      message: error.message ?? "Failed to fetch shared note",
    };
  }

  return { success: true, data };
}

/**
 * Revokes access to a shared note by token via RPC.
 */
export async function revokeAccess(supabase, token) {
  if (!supabase) {
    return { success: false, message: "Supabase client is required" };
  }

  const { error } = await supabase.rpc("revoke_access_to_shared_note", {
    s_token: token,
  });

  if (error) return { success: false, message: error.message };

  return { success: true };
}

/**
 * Shares a note with an expiration date.
 */
export async function share(supabase, sharedEntry) {
  if (!supabase) {
    return { success: false, message: "Supabase client is required" };
  }

  if (!sharedEntry?.note_id || !sharedEntry?.expired_at) {
    return {
      success: false,
      message: "Invalid request",
    };
  }

  const entry = {
    created_at: new Date().toISOString(),
    ...sharedEntry,
  };

  const { data, error } = await supabase.from("shared").insert(entry).select();

  if (error) return { success: false, message: error.message };

  const shared_entry = data[0];

  return { success: true, data: shared_entry };
}

/**
 * Creates a new note.
 */
export async function create(supabase, note) {
  if (!supabase) {
    return { success: false, message: "Supabase client is required" };
  }

  if (!note?.title) {
    return {
      success: false,
      message: "Title must be valid",
    };
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      ...note,
    })
    .select();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, data: data?.[0] };
}

/**
 * Updates an existing note by ID.
 */
export async function update(supabase, id, data) {
  if (!supabase) {
    return { success: false, message: "Supabase client is required" };
  }

  if (!id) {
    return {
      success: false,
      message: "Note id is not valid",
    };
  }

  const { data: arr, error } = await supabase
    .from("notes")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, data: arr?.[0] };
}

/**
 * Deletes a note by ID and removes any shared references.
 */
export async function remove(supabase, id) {
  if (!supabase) {
    return { success: false, message: "Supabase client is required" };
  }

  if (!id) return { success: false, message: "Note id must be valid" };

  // deleting any row of shared that references this note
  const { error: sharedError } = await supabase.rpc("remove_references", {
    note_id: id,
  });

  const { error: notesError } = await supabase
    .from("notes")
    .delete()
    .eq("id", id);

  if (sharedError || notesError) {
    return {
      success: false,
      message: sharedError?.message ?? notesError?.message,
    };
  }

  return { success: true };
}
