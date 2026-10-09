"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const LIMIT = 5;

export async function fetchNotes(cursor) {
 	const cookieStore = await cookies();
	const supabase = createClient(cookieStore);
	let query = supabase
    .from("notes")
    .select("id, title, created_at, updated_at, pinned") // not taking user_id, content
    .eq("pinned", false)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false }) // only for tie breaking
    .limit(LIMIT + 1); // taking one extra note

  if (cursor) {
    // or is separated by ',' just like and
    query = query.or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`)
  }

  const { error, data } = await query;

  if (error) {
    console.error('error while getting initial notes: ', error.message);
    return { success: false, message: error.message ?? "Error while getting initial notes" };
  }

  const hasNext = data.length > LIMIT; // if we receive 6 instead of 5 that is our next
  const notes = hasNext ? data.slice(0, LIMIT) : data; // 0-9
  const lastItem = notes[notes.length - 1];

  return {
    success: true,
    data: {
      notes,
      cursor: hasNext && lastItem ? { created_at: lastItem.created_at, id: lastItem.id } : null
    }
    // redundant check of lastItem
  };
}

export async function fetchPinnedNotes(cursor) {
 	const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
	let query = supabase
    .from("notes")
    .select("id, title, created_at, updated_at, pinned")
    .eq("pinned", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(LIMIT+1);

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    )
	}

  const { error, data } = await query;

  if (error) {
		console.error('error while getting initial pinned notes: ', error.message);
		return { success: false, message: error.message ?? "Error while getting initial pinned notes" };
   }

  const hasNext = data.length > LIMIT;
  const notes = hasNext ? data.slice(0, LIMIT) : data;
  const lastNote = notes[notes.length - 1];

  return {
    success: true,
    data: {
      notes,
      cursor: hasNext && lastNote ? { created_at: lastNote.created_at, id: lastNote.id } : null
  } };
}

export async function getNoteById(id) {
	const cookieStore = await cookies();
	const supabase = createClient(cookieStore);
	const { error, data } = await supabase.from("notes").select("*").eq("id", id).single();
	if (error) {
		console.error('error while getting note by id: ', error.message);
		return { success: false, message: error.message ?? "Error while getting note by id" };
  }
  return { success: true, data };
}

export async function fetchAll() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message ?? "Failed to fetch notes")
    return { success: false, message: error.message };
  }

  return { success: true, data };
}

export async function fetchShared() {
  const supabase = createClient(await cookies());
  const { data: sharedEntries, error } = await supabase
    .from("shared")
    .select("*");

  if (error) {
    console.error(error.message ?? "Failed to fetch shared entries")
    return { success: false, message: error.message };
  }
  return { success: true, data: sharedEntries };
}

export async function getSharedNoteByToken(token) {
  if (!token) throw new Error("Invalid request");
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.rpc("get_shared_note", {
    s_token: token,
  });
  if (error) {
    console.error(error.message ?? "Failed to fetch shared note")
    return { success: false, message: error.message ?? "Failed to fetch shared note" };
  }
  return { success: true, data };
}

export async function revokeAccess(token) {
  const supabase = createClient(await cookies());
  const { error } = await supabase.rpc("revoke_access_to_shared_note", {
    s_token: token
  });
  if (error) return { success: false, message: error.message };
  return { success: true };
  }

export async function share(sharedEntry) {
  if (!sharedEntry.note_id || !sharedEntry.expired_at)
    return {
      success: false,
      message: "Invalid request",
    };

  const entry = {
    created_at: new Date().toISOString(),
    ...sharedEntry,
  };

  const supabase = createClient(await cookies());

  const { data, error } = await supabase.from("shared").insert(entry).select();

  if (error) return { success: false, message: error.message };

  const shared_entry = data[0];

  return { success: true, data: shared_entry };
}

export async function create(note) {
  if (!note.title)
    return {
      success: false,
      message: "Title must be valid",
    };

  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("notes")
    .insert({
      ...note,
    })
    .select(); // to get the inserted note

  if (error) {
    return { success: false, message: error.message };
  }

  const { user_id, ...newEntry } = data[0];

  return { success: true, data: newEntry };
}

export async function update(id, data) {
  if (!id)
    return {
      success: false,
      message: "Note id is not valid",
    };

  const supabase = createClient(await cookies());

  const { error } = await supabase
    .from("notes")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Updated successfully!" };
}

export async function remove(id) {
  if (!id) return { success: false, message: "Note id must be valid" };

  const supabase = createClient(await cookies());

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

// this returns plain objects since nextjs can send only plain objects from server components so NextResponse.json() only will work for api route.js
