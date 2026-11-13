"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import {
  fetchNotes as sharedFetchNotes,
  searchNotes as sharedSearchNotes,
  fetchPinnedNotes as sharedFetchPinnedNotes,
  getNoteById as sharedGetNoteById,
  fetchAll as sharedFetchAll,
  fetchShared as sharedFetchShared,
  getSharedEntry as sharedGetSharedEntry,
  getSharedNoteByToken as sharedGetSharedNoteByToken,
  revokeAccess as sharedRevokeAccess,
  share as sharedShare,
  create as sharedCreate,
  update as sharedUpdate,
  remove as sharedRemove,
} from "@/app/shared/notes";

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export async function fetchNotes(cursor) {
  const supabase = await getSupabaseClient();
  return sharedFetchNotes(supabase, cursor);
}

export async function searchNotes(query) {
  const supabase = await getSupabaseClient();
  return sharedSearchNotes(supabase, query);
}

export async function fetchPinnedNotes(cursor) {
  const supabase = await getSupabaseClient();
  return sharedFetchPinnedNotes(supabase, cursor);
}

export async function getNoteById(id) {
  const supabase = await getSupabaseClient();
  return sharedGetNoteById(supabase, id);
}

export async function fetchAll() {
  const supabase = await getSupabaseClient();
  return sharedFetchAll(supabase);
}

export async function fetchShared() {
  const supabase = await getSupabaseClient();
  return sharedFetchShared(supabase);
}

export async function getSharedEntry(id) {
  const supabase = await getSupabaseClient();
  return sharedGetSharedEntry(supabase, id);
}

export async function getSharedNoteByToken(token) {
  const supabase = await getSupabaseClient();
  return sharedGetSharedNoteByToken(supabase, token);
}

export async function revokeAccess(token) {
  const supabase = await getSupabaseClient();
  return sharedRevokeAccess(supabase, token);
}

export async function share(sharedEntry) {
  const supabase = await getSupabaseClient();
  return sharedShare(supabase, sharedEntry);
}

export async function create(note) {
  const supabase = await getSupabaseClient();
  return sharedCreate(supabase, note);
}

export async function update(id, data) {
  const supabase = await getSupabaseClient();
  return sharedUpdate(supabase, id, data);
}

export async function remove(id) {
  const supabase = await getSupabaseClient();
  return sharedRemove(supabase, id);
}

// this returns plain objects since nextjs can send only plain objects from server components so NextResponse.json() only will work for api route.js
