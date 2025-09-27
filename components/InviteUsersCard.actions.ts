"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { headers } from "next/headers";
import { randomBytes } from "crypto";

export interface InvitationData {
  emails: string[];
  organizationId: string;
  role: string;
}

export const inviteUsersAction = async (
  data: InvitationData
): Promise<ActionResponse<{ invited: number; existing: number; invalid: string[] }>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const userMembership = await db.member.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: data.organizationId,
        },
      },
    });

    const isAdmin = userMembership?.role === "admin" || userMembership?.role === "owner";
    const isSuperAdmin = session.user.role === "super-admin";

    if (!isAdmin && !isSuperAdmin) {
      return getActionResponse({ error: "Access denied" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = data.emails.filter(email => emailRegex.test(email));
    const invalidEmails = data.emails.filter(email => !emailRegex.test(email));

    let invited = 0;
    let existing = 0;

    for (const email of validEmails) {
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        const existingMember = await db.member.findUnique({
          where: {
            userId_organizationId: {
              userId: existingUser.id,
              organizationId: data.organizationId,
            },
          },
        });

        if (existingMember) {
          existing++;
          continue;
        }
      }

      const existingInvitation = await db.invitation.findUnique({
        where: {
          email_organizationId: {
            email,
            organizationId: data.organizationId,
          },
        },
      });

      if (existingInvitation) {
        existing++;
        continue;
      }

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      await db.invitation.create({
        data: {
          email,
          organizationId: data.organizationId,
          role: data.role,
          inviterId: session.user.id,
          token,
          expiresAt,
          status: "pending",
        },
      });

      invited++;
    }

    return getActionResponse({
      data: {
        invited,
        existing,
        invalid: invalidEmails,
      },
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getPendingInvitationsAction = async (
  organizationId: string
): Promise<ActionResponse<{
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
  status: string;
}[]>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const userMembership = await db.member.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId,
        },
      },
    });

    const isAdmin = userMembership?.role === "admin" || userMembership?.role === "owner";
    const isSuperAdmin = session.user.role === "super-admin";

    if (!isAdmin && !isSuperAdmin) {
      return getActionResponse({ error: "Access denied" });
    }

    const invitations = await db.invitation.findMany({
      where: {
        organizationId,
        status: "pending",
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        expiresAt: true,
        status: true,
      },
    });

    return getActionResponse({ data: invitations });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const revokeInvitationAction = async (
  invitationId: string
): Promise<ActionResponse<{ success: boolean }>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return getActionResponse({ error: "Invitation not found" });
    }

    const userMembership = await db.member.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: invitation.organizationId,
        },
      },
    });

    const isAdmin = userMembership?.role === "admin" || userMembership?.role === "owner";
    const isSuperAdmin = session.user.role === "super-admin";

    if (!isAdmin && !isSuperAdmin) {
      return getActionResponse({ error: "Access denied" });
    }

    await db.invitation.delete({
      where: { id: invitationId },
    });

    return getActionResponse({ data: { success: true } });
  } catch (error) {
    return getActionResponse({ error });
  }
};