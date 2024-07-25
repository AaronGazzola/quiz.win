"use server";

import getActionResponse from "@/actions/getActionResponse";
import { SignInSchemaType } from "@/app/auth/components/AuthForm";
import getSupabaseServerActionClient from "@/clients/action-client";
import { ActionResponse } from "@/types/action.types";
import { User } from "@supabase/supabase-js";
import "server-only";
/**
 * @name signInWithEmailAction
 * @description Signs in the user using email and password credentials.
 * This is used in the sign in page.
 */
async function signInWithEmailAction(
  credentials: SignInSchemaType
): Promise<ActionResponse<User>> {
  const client = getSupabaseServerActionClient();
  // TODO(aaron): handle stay signed in option
  try {
    const { error, data } = await client.auth.signInWithPassword(credentials);
    if (error) throw error;
    return getActionResponse({ data: data.user });
  } catch (error) {
    return getActionResponse({ error });
  }
}

export default signInWithEmailAction;
