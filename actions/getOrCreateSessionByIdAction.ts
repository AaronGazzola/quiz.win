"use server";
import getActionResponse from "@/actions/getActionResponse";
import getSupabaseServerComponentClient from "@/clients/server-component-client";
import { createSessionQuery } from "@/queries/createSessionQuery";
import { getSessionByIdQuery } from "@/queries/getSessionByIdQuery";
import { ActionResponse } from "@/types/action.types";
import { SessionRow } from "@/types/db.types";
import "server-only";

/**
 * @name getOrCreateSessionByIdAction
 * @description gets a session by id, or creates a new one if none is found
 */
async function getOrCreateSessionByIdAction(
  localId?: string | null
): Promise<ActionResponse<SessionRow>> {
  const client = getSupabaseServerComponentClient();

  try {
    if (localId) {
      const { data, error } = await getSessionByIdQuery(client, localId);
      if (data) return getActionResponse({ data, error });
    }
    const { data, error } = await createSessionQuery(client);
    return getActionResponse({ data, error });
  } catch (error) {
    return getActionResponse({ error });
  }
}

export default getOrCreateSessionByIdAction;
