"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { headers } from "next/headers";
import { User, Profile } from "@prisma/client";
import { ExtendedUser } from "./layout.types";

export const getUserAction = async (): Promise<ActionResponse<User | null>> => {
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
    });

    console.log(JSON.stringify({action:"getUserAction",step:"user_query_result",hasUser:!!prismaUser}));

    if (!prismaUser) {
      console.log(JSON.stringify({action:"getUserAction",step:"no_prisma_user"}));
      return getActionResponse();
    }

    console.log(JSON.stringify({action:"getUserAction",step:"success"}));
    return getActionResponse({ data: prismaUser });
  } catch (error) {
    console.log(JSON.stringify({action:"getUserAction",step:"error",error:error instanceof Error?{name:error.name,message:error.message}:error}));
    return getActionResponse({ error });
  }
};

export const getUserMembersAction = async (): Promise<ActionResponse<ExtendedUser | null>> => {
  try {
    console.log(JSON.stringify({action:"getUserMembersAction",step:"start"}));

    console.log(JSON.stringify({action:"getUserMembersAction",step:"calling_auth.api.getSession"}));
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log(JSON.stringify({action:"getUserMembersAction",step:"session_result",hasUser:!!session?.user,userId:session?.user?.id?.substring(0,8)+"***"}));

    if (!session?.user) {
      console.log(JSON.stringify({action:"getUserMembersAction",step:"no_session_user"}));
      return getActionResponse();
    }

    console.log(JSON.stringify({action:"getUserMembersAction",step:"calling_getAuthenticatedClient"}));
    const { db } = await getAuthenticatedClient();

    console.log(JSON.stringify({action:"getUserMembersAction",step:"calling_db.user.findUnique"}));
    const prismaUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        members: {
          include: {
            organization: true,
          },
        },
      },
    });

    console.log(JSON.stringify({action:"getUserMembersAction",step:"user_query_result",hasUser:!!prismaUser}));

    if (!prismaUser) {
      console.log(JSON.stringify({action:"getUserMembersAction",step:"no_prisma_user"}));
      return getActionResponse();
    }

    console.log(JSON.stringify({action:"getUserMembersAction",step:"calling_db.profile.findUnique"}));
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    console.log(JSON.stringify({action:"getUserMembersAction",step:"profile_query_result",hasProfile:!!profile}));

    const userWithProfileAndMembers = {
      ...prismaUser,
      profile,
    };

    console.log(JSON.stringify({action:"getUserMembersAction",step:"success"}));
    return getActionResponse({ data: userWithProfileAndMembers });
  } catch (error) {
    console.log(JSON.stringify({action:"getUserMembersAction",step:"error",error:error instanceof Error?{name:error.name,message:error.message}:error}));
    return getActionResponse({ error });
  }
};

export const getUserProfileAction = async (): Promise<ActionResponse<Profile | null>> => {
  try {
    console.log(JSON.stringify({action:"getUserProfileAction",step:"start"}));

    console.log(JSON.stringify({action:"getUserProfileAction",step:"calling_auth.api.getSession"}));
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log(JSON.stringify({action:"getUserProfileAction",step:"session_result",hasUser:!!session?.user,userId:session?.user?.id?.substring(0,8)+"***"}));

    if (!session?.user) {
      console.log(JSON.stringify({action:"getUserProfileAction",step:"no_session_user"}));
      return getActionResponse();
    }

    console.log(JSON.stringify({action:"getUserProfileAction",step:"calling_getAuthenticatedClient"}));
    const { db } = await getAuthenticatedClient();

    console.log(JSON.stringify({action:"getUserProfileAction",step:"calling_db.profile.findUnique"}));
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    console.log(JSON.stringify({action:"getUserProfileAction",step:"profile_query_result",hasProfile:!!profile}));

    console.log(JSON.stringify({action:"getUserProfileAction",step:"success"}));
    return getActionResponse({ data: profile });
  } catch (error) {
    console.log(JSON.stringify({action:"getUserProfileAction",step:"error",error:error instanceof Error?{name:error.name,message:error.message}:error}));
    return getActionResponse({ error });
  }
};