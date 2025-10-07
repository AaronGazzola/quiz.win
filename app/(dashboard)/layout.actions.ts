"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { headers } from "next/headers";

export interface PendingInvitation {
  id: string;
  organizationId: string;
  organizationName: string;
  role: string;
  inviterName: string;
  inviterEmail: string;
  createdAt: Date;
  expiresAt: Date;
}

export const getPendingInvitationsForUserAction = async (): Promise<ActionResponse<PendingInvitation[]>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const { db } = await getAuthenticatedClient();

    const invitations = await db.invitation.findMany({
      where: {
        email: session.user.email,
        status: "pending",
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const pendingInvitations: PendingInvitation[] = invitations.map((inv) => ({
      id: inv.id,
      organizationId: inv.organization.id,
      organizationName: inv.organization.name,
      role: inv.role,
      inviterName: inv.user.name || inv.user.email,
      inviterEmail: inv.user.email,
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt,
    }));

    return getActionResponse({ data: pendingInvitations });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const acceptInvitationAction = async (
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
      body: { invitationId },
      headers: await headers(),
    });

    return getActionResponse({ data: true });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const declineInvitationAction = async (
  invitationId: string
): Promise<ActionResponse<boolean>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const { db } = await getAuthenticatedClient();

    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return getActionResponse({ error: "Invitation not found" });
    }

    if (invitation.email !== session.user.email) {
      return getActionResponse({ error: "Access denied" });
    }

    await db.invitation.update({
      where: { id: invitationId },
      data: { status: "declined" },
    });

    return getActionResponse({ data: true });
  } catch (error) {
    return getActionResponse({ error });
  }
};
