"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
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
    conditionalLog({action:"verifyPasswordAction",passwordLength:password.length},{label:LOG_LABELS.AUTH});
    const { db } = await getAuthenticatedClient();

    const storedPassword = await db.password.findFirst();
    conditionalLog({storedPasswordFound:!!storedPassword},{label:LOG_LABELS.AUTH});

    if (!storedPassword) {
      conditionalLog({error:"Password not configured"},{label:LOG_LABELS.AUTH});
      return getActionResponse({ error: "Password not configured" });
    }

    const isValid = await bcrypt.compare(password, storedPassword.hash);
    conditionalLog({bcryptCompareResult:isValid},{label:LOG_LABELS.AUTH});

    return getActionResponse({ data: isValid });
  } catch (error) {
    conditionalLog({verifyPasswordActionError:error},{label:LOG_LABELS.AUTH});
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
