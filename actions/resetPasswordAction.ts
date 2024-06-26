"use server";

import getActionResponse from "@/actions/getActionResponse";
import getSupabaseServerActionClient from "@/clients/action-client";
import { ActionResponse, ResetPasswordFormValues } from "@/types/action.types";
import "server-only";

/**
 * @name resetPasswordAction
 * @description Updates the password of the logged in user */
async function resetPasswordAction({
  password,
}: ResetPasswordFormValues): Promise<ActionResponse<null>> {
  const client = getSupabaseServerActionClient();

  try {
    const { error } = await client.auth.updateUser({ password });
    if (error) throw error;
    return getActionResponse();
  } catch (error) {
    return getActionResponse({ error });
  }
}

export default resetPasswordAction;
