"use server";

import getActionResponse from "@/actions/getActionResponse";
import getSupabaseServerActionClient from "@/clients/action-client";
import { ActionResponse } from "@/types/action.types";
import { AuthFormValues } from "@/types/auth.types";
import "server-only";

/**
 * @name signUpWithEmailAction
 * @description Signs Up the user using email and password credentials.
 * This is used in the sign up page.
 */
async function signUpWithEmailAction(
  credentials: AuthFormValues
): Promise<ActionResponse<null>> {
  const client = getSupabaseServerActionClient();
  // TODO(aaron): handle stay signed in option

  try {
    const { error } = await client.auth.signUp(credentials);
    if (error) throw error;
    return getActionResponse();
  } catch (error) {
    return getActionResponse({ error });
  }
}

export default signUpWithEmailAction;
