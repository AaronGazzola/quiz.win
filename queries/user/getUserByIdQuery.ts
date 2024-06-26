import { Database } from '@/db/database.types'
import { USERS_TABLE } from '@/db/db-tables'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * @description Fetch user object data (not auth!) by id
 */
export async function getUserByIdQuery(client: SupabaseClient<Database>, id: string) {
  const { data, error } = await client
    .from(USERS_TABLE)
    .select(
      `
      id,
      displayName: display_name,
      photoUrl: photo_url,
      email,
      registrationAllowed: registration_allowed
    `,
    )
    .eq('id', id)
    .maybeSingle()

  return { data, error }
}
