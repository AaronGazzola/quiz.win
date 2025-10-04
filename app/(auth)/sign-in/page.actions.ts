"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";

export const getPasswordLengthAction = async (): Promise<ActionResponse<number>> => {
  try {
    const { db } = await getAuthenticatedClient();

    const password = await db.password.findFirst();

    if (!password) {
      return getActionResponse({ error: "Password not configured" });
    }

    return getActionResponse({ data: password.length });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const verifyPasswordAction = async (password: string): Promise<ActionResponse<boolean>> => {
  try {
    const { db } = await getAuthenticatedClient();

    const storedPassword = await db.password.findFirst();

    if (!storedPassword) {
      return getActionResponse({ error: "Password not configured" });
    }

    const isValid = await bcrypt.compare(password, storedPassword.hash);

    return getActionResponse({ data: isValid });
  } catch (error) {
    return getActionResponse({ error });
  }
};

interface UserWithOrganization extends User {
  organizationName?: string;
}

export const getUsersWithOrganizationsAction = async (): Promise<ActionResponse<UserWithOrganization[]>> => {
  try {
    const { db } = await getAuthenticatedClient();

    const users = await db.user.findMany({
      include: {
        members: {
          include: {
            organization: true,
          },
        },
      },
    });

    const usersWithOrgs = users.map(user => ({
      ...user,
      organizationName: user.members?.[0]?.organization?.name,
    }));

    return getActionResponse({ data: usersWithOrgs });
  } catch (error) {
    return getActionResponse({ error });
  }
};
