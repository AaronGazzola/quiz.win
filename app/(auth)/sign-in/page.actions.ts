"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { user } from "@prisma/client";

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
