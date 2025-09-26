"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const processInvitationAction = async (
  invitationId: string
): Promise<ActionResponse<boolean>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    await auth.api.acceptInvitation({
      invitationId,
      headers: await headers(),
    });

    return getActionResponse({ data: true });
  } catch (error) {
    return getActionResponse({ error });
  }
};