"use server";

import getActionResponse from "@/actions/getActionResponse";
import { SignUpSchemaType } from "@/app/auth/components/AuthForm";
import getSupabaseServerActionClient from "@/clients/action-client";
import configuration from "@/lib/configuration";
import { ActionResponse } from "@/types/action.types";
import "server-only";

/**
 * @name signUpWithEmailAction
 * @description Signs Up the user using email and password credentials.
 * This is used in the sign up page.
 */
async function signUpWithEmailAction(
  credentials: SignUpSchemaType
): Promise<ActionResponse<null>> {
  const client = getSupabaseServerActionClient();
  // TODO(aaron): handle stay signed in option

  try {
    const { error } = await client.auth.signUp({
      ...credentials,
      options: {
        emailRedirectTo: `${configuration.site.siteUrl}${configuration.paths.authCallback}?welcome=true`,
      },
    });
    if (error) throw error;
    return getActionResponse();
  } catch (error) {
    return getActionResponse({ error });
  }
}

export default signUpWithEmailAction;
