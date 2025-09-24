"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { headers } from "next/headers";
import { ExtendedUser } from "./layout.types";

export const getUserAction = async (): Promise<ActionResponse<ExtendedUser | null>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return getActionResponse();

    const { db } = await getAuthenticatedClient();

    const prismaUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!prismaUser) return getActionResponse();

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    const userWithProfile = {
      ...prismaUser,
      profile,
    };

    return getActionResponse({ data: userWithProfile });
  } catch (error) {
    return getActionResponse({ error });
  }
};