"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { getAuthenticatedClient } from "@/lib/auth.utils";

export const processInvitationAction = async (
  organizationId: string,
  role: string
): Promise<ActionResponse<boolean>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const organization = await db.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return getActionResponse({ error: "Organization not found" });
    }

    const existingMember = await db.member.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId
        }
      }
    });

    if (existingMember) {
      return getActionResponse({ error: "You are already a member of this organization" });
    }

    await db.member.create({
      data: {
        userId: user.id,
        organizationId,
        role: role === "admin" ? "admin" : "member"
      }
    });

    return getActionResponse({ data: true });
  } catch (error) {
    return getActionResponse({ error });
  }
};