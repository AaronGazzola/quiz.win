"use server";

import getActionResponse from "@/actions/getActionResponse";
import getSupabaseServerActionClient from "@/clients/action-client";
import configuration from "@/lib/configuration";
import { ActionResponse, ForgotPasswordFormValues } from "@/types/action.types";
import "server-only";

/**
 * @name forgotPasswordAction
 * @description Sends an email to the user with a link to the reset password page
 */
async function forgotPasswordAction({
  email,
}: ForgotPasswordFormValues): Promise<ActionResponse<null>> {
  const client = getSupabaseServerActionClient();

  try {
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${configuration.site.siteUrl}${configuration.paths.resetPasswordCallback}`,
    });
    if (error) throw error;
    return getActionResponse();
  } catch (error) {
    return getActionResponse({ error });
  }
}

export default forgotPasswordAction;
