import { Database } from "@/types/database.types";
import { Table } from "@/types/db.types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * @description Fetch user object data (not auth!) by id along with their stories
 */
export async function getSessionByIdQuery(
  client: SupabaseClient<Database>,
  id: string
) {
  const { data: userData, error: userError } = await client
    .from(Table.Sessions)
    .select(`*`)
    .eq("id", id)
    .single();

  return { data: userData, error: userError };
}
