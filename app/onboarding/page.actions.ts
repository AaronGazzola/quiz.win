"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { Profile } from "@prisma/client";

interface CreateProfileData {
  userId: string;
  preferences: {
    notifications: boolean;
    theme: "light" | "dark";
  };
}

export const createProfileAction = async (
  data: CreateProfileData
): Promise<ActionResponse<Profile>> => {
  try {
    const { db } = await getAuthenticatedClient();

    const profile = await db.profile.upsert({
      where: { userId: data.userId },
      create: {
        userId: data.userId,
        isOnboardingComplete: true,
        preferences: data.preferences,
      },
      update: {
        isOnboardingComplete: true,
        preferences: data.preferences,
      },
    });

    return getActionResponse({ data: profile });
  } catch (error) {
    return getActionResponse({ error });
  }
};