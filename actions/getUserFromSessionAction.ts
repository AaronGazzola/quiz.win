"use server";
import getActionResponse from "@/actions/getActionResponse";
import getSupabaseServerComponentClient from "@/clients/server-component-client";
import { getUserByEmailQuery } from "@/queries/user/getUserByEmailQuery";
import { ActionResponse, Profile, SessionResponse } from "@/types/action.types";
import { Session } from "inspector";
import "server-only";

/**
 * @name getProfileFromSessionAction
 * @description Loads user data from auth schema, and profile data from public schema.
 * This is used in the (site) layout to display the user's name and avatar.
 */
async function getProfileFromSessionAction(): Promise<SessionResponse> {
  const client = getSupabaseServerComponentClient();

  try {
    const { data: sessionData, error: sessionError } =
      await client.auth.getSession();

    const session = sessionData.session;
    const sessionEmail = session?.user.email;
    if (!session || !sessionEmail) throw new Error("No session found");
    if (sessionError) throw sessionError;

    const { data: profile, error: userError } = await getUserByEmailQuery(
      client,
      sessionEmail
    );
    if (userError) throw userError;
    if (!(profile instanceof ProfileRow)) {
      await client.auth.signOut();
      throw new Error("No profile found for session email");
    }

    return getActionResponse({
      data: {
        session,
        profile,
      },
    });
  } catch (error) {
    return getActionResponse({ error });
  }
}

export default getProfileFromSessionAction;
