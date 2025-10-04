"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
import { user } from "@prisma/client";
import bcrypt from "bcryptjs";

export const getPasswordLengthAction = async (): Promise<
  ActionResponse<number>
> => {
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

export const verifyPasswordAction = async (
  password: string
): Promise<ActionResponse<boolean>> => {
  try {
    conditionalLog(
      { action: "verifyPasswordAction", passwordLength: password.length },
      { label: LOG_LABELS.AUTH }
    );
    const { db } = await getAuthenticatedClient();

    const storedPassword = await db.password.findFirst();
    conditionalLog(
      { storedPasswordFound: !!storedPassword },
      { label: LOG_LABELS.AUTH }
    );

    if (!storedPassword) {
      conditionalLog(
        { error: "Password not configured" },
        { label: LOG_LABELS.AUTH }
      );
      return getActionResponse({ error: "Password not configured" });
    }

    const isValid = await bcrypt.compare(password, storedPassword.hash);
    conditionalLog(
      { bcryptCompareResult: isValid },
      { label: LOG_LABELS.AUTH }
    );

    return getActionResponse({ data: isValid });
  } catch (error) {
    conditionalLog(
      { verifyPasswordActionError: error },
      { label: LOG_LABELS.AUTH }
    );
    return getActionResponse({ error });
  }
};

interface UserWithOrganization extends user {
  organizationName?: string;
  organizations: Array<{
    organizationName: string;
    role: "owner" | "admin" | "member";
  }>;
}

export const getUsersWithOrganizationsAction = async (): Promise<
  ActionResponse<UserWithOrganization[]>
> => {
  try {
    const { db } = await getAuthenticatedClient();

    const users = await db.user.findMany({
      include: {
        member: {
          include: {
            organization: true,
          },
        },
      },
    });

    const usersWithOrgs = users.map((user) => ({
      ...user,
      organizationName: user.member?.[0]?.organization?.name,
      organizations: user.member.map((m) => ({
        organizationName: m.organization.name,
        role: m.role as "owner" | "admin" | "member",
      })),
    }));

    return getActionResponse({ data: usersWithOrgs });
  } catch (error) {
    return getActionResponse({ error });
  }
};
