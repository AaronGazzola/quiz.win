import { Database } from "@/types/database.types";
import { Table } from "@/types/db.types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * @description Fetch user object data (not auth!) by email
 */
export async function getUserByEmailQuery(
  client: SupabaseClient<Database>,
  email: string
) {
  const { data, error } = await client
    .from(Table.Profiles)
    .select("*")
    .eq("email", email)
    .maybeSingle();

  return { data, error };
}
