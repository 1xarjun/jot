"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function fetchAll() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error.message ?? "Failed to fetch notes")
    return { success: false, message: error.message };
  }

  const notes = data.map(({ user_id, ...rest }) => rest);

  return { success: true, data: notes };
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

export async function fetchSharedNoteByToken(token) {
  if (!token) return { success: false, message: "Invalid request" };
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.rpc("get_shared_note", {
    s_token: token,
  });
  if (error) return { success: false, message: error.message };
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
