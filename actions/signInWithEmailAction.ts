"use server";

import getActionResponse from "@/actions/getActionResponse";
import getSupabaseServerActionClient from "@/clients/action-client";
import { ActionResponse } from "@/types/action.types";
import { AuthFormValues } from "@/types/auth.types";
import "server-only";

/**
 * @name signInWithEmailAction
 * @description Signs in the user using email and password credentials.
 * This is used in the sign in page.
 */
async function signInWithEmailAction(
  credentials: AuthFormValues
): Promise<ActionResponse<null>> {
  const client = getSupabaseServerActionClient();
  // TODO(aaron): handle stay signed in option

  try {
    const { error } = await client.auth.signInWithPassword(credentials);
    if (error) throw error;
    return getActionResponse();
  } catch (error) {
    return getActionResponse({ error });
  }
}

export default signInWithEmailAction;
