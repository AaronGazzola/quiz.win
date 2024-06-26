import { Database } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * @description Create a new user in the public schema (not auth!)
 */
export async function createUserQuery(
  client: SupabaseClient<Database>,
  {
    email,
    name,
  }: {
    email: string;
    name: string;
  }
) {
  const { data, error } = await client.from(Database).insert({
    display_name: name,
    email: email,
  });
  return { data, error };
}
