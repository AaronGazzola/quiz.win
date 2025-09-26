"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { headers } from "next/headers";
import { ExtendedUser } from "./layout.types";

export const getUserAction = async (): Promise<ActionResponse<ExtendedUser | null>> => {
  try {
    console.log(JSON.stringify({action:"getUserAction",step:"start"}));

    console.log(JSON.stringify({action:"getUserAction",step:"calling_auth.api.getSession"}));
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log(JSON.stringify({action:"getUserAction",step:"session_result",hasUser:!!session?.user,userId:session?.user?.id?.substring(0,8)+"***"}));

    if (!session?.user) {
      console.log(JSON.stringify({action:"getUserAction",step:"no_session_user"}));
      return getActionResponse();
    }

    console.log(JSON.stringify({action:"getUserAction",step:"calling_getAuthenticatedClient"}));
    const { db } = await getAuthenticatedClient();

    console.log(JSON.stringify({action:"getUserAction",step:"calling_db.user.findUnique"}));
    const prismaUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        members: true,
      },
    });

    console.log(JSON.stringify({action:"getUserAction",step:"user_query_result",hasUser:!!prismaUser}));

    if (!prismaUser) {
      console.log(JSON.stringify({action:"getUserAction",step:"no_prisma_user"}));
      return getActionResponse();
    }

    console.log(JSON.stringify({action:"getUserAction",step:"calling_db.profile.findUnique"}));
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    console.log(JSON.stringify({action:"getUserAction",step:"profile_query_result",hasProfile:!!profile}));

    const userWithProfile = {
      ...prismaUser,
      profile,
    };

    console.log(JSON.stringify({action:"getUserAction",step:"success"}));
    return getActionResponse({ data: userWithProfile });
  } catch (error) {
    console.log(JSON.stringify({action:"getUserAction",step:"error",error:error instanceof Error?{name:error.name,message:error.message}:error}));
    return getActionResponse({ error });
  }
};