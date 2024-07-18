import { Database } from "@/types/database.types";
import { Table } from "@/types/db.types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * @description Create a new session with provided session data
 */
export async function createSessionQuery(
  client: SupabaseClient<Database>,
  sessionData: Partial<Database["public"]["Tables"]["sessions"]["Row"]> = {}
) {
  const { data: newSession, error: sessionError } = await client
    .from(Table.Sessions)
    .insert(sessionData)
    .select("*")
    .single();

  return { data: newSession, error: sessionError };
}
