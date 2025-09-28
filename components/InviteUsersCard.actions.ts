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
  console.log(JSON.stringify({inviteAction:"start",emailCount:data.emails.length,orgId:data.organizationId,role:data.role}));

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.log(JSON.stringify({inviteAction:"unauthorized"}));
      return getActionResponse({ error: "Unauthorized" });
    }

    console.log(JSON.stringify({inviteAction:"auth_check",userId:session.user.id}));

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

    console.log(JSON.stringify({inviteAction:"permission_check",isAdmin,isSuperAdmin,userRole:userMembership?.role}));

    if (!isAdmin && !isSuperAdmin) {
      console.log(JSON.stringify({inviteAction:"access_denied"}));
      return getActionResponse({ error: "Access denied" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = data.emails.filter(email => emailRegex.test(email));
    const invalidEmails = data.emails.filter(email => !emailRegex.test(email));

    console.log(JSON.stringify({inviteAction:"email_validation",valid:validEmails.length,invalid:invalidEmails.length}));

    let invited = 0;
    let existing = 0;

    for (const email of validEmails) {
      console.log(JSON.stringify({inviteAction:"processing_email",email:email?.substring(0,3)+"***"}));

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
          console.log(JSON.stringify({inviteAction:"existing_member",email:email?.substring(0,3)+"***"}));
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
        console.log(JSON.stringify({inviteAction:"existing_invitation",email:email?.substring(0,3)+"***"}));
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

      console.log(JSON.stringify({inviteAction:"invitation_created",email:email?.substring(0,3)+"***",role:data.role}));
      invited++;
    }

    console.log(JSON.stringify({inviteAction:"complete",invited,existing,invalid:invalidEmails.length}));

    return getActionResponse({
      data: {
        invited,
        existing,
        invalid: invalidEmails,
      },
    });
  } catch (error) {
    console.log(JSON.stringify({inviteAction:"error",error:error instanceof Error?error.message:"unknown"}));
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
  console.log(JSON.stringify({getPendingInvitations:"start",orgId:organizationId}));

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.log(JSON.stringify({getPendingInvitations:"unauthorized"}));
      return getActionResponse({ error: "Unauthorized" });
    }

    console.log(JSON.stringify({getPendingInvitations:"auth_check",userId:session.user.id}));

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

    console.log(JSON.stringify({getPendingInvitations:"permission_check",isAdmin,isSuperAdmin,userRole:userMembership?.role}));

    if (!isAdmin && !isSuperAdmin) {
      console.log(JSON.stringify({getPendingInvitations:"access_denied"}));
      return getActionResponse({ error: "Access denied" });
    }

    console.log(JSON.stringify({getPendingInvitations:"fetching_invitations"}));

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

    console.log(JSON.stringify({getPendingInvitations:"complete",count:invitations.length}));

    return getActionResponse({ data: invitations });
  } catch (error) {
    console.log(JSON.stringify({getPendingInvitations:"error",error:error instanceof Error?error.message:"unknown"}));
    return getActionResponse({ error });
  }
};

export const revokeInvitationAction = async (
  invitationId: string
): Promise<ActionResponse<{ success: boolean }>> => {
  console.log(JSON.stringify({revokeInvitation:"start",invitationId}));

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.log(JSON.stringify({revokeInvitation:"unauthorized"}));
      return getActionResponse({ error: "Unauthorized" });
    }

    console.log(JSON.stringify({revokeInvitation:"auth_check",userId:session.user.id}));

    const { db } = await getAuthenticatedClient();

    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      console.log(JSON.stringify({revokeInvitation:"not_found",invitationId}));
      return getActionResponse({ error: "Invitation not found" });
    }

    console.log(JSON.stringify({revokeInvitation:"invitation_found",email:invitation.email?.substring(0,3)+"***",orgId:invitation.organizationId}));

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

    console.log(JSON.stringify({revokeInvitation:"permission_check",isAdmin,isSuperAdmin,userRole:userMembership?.role}));

    if (!isAdmin && !isSuperAdmin) {
      console.log(JSON.stringify({revokeInvitation:"access_denied"}));
      return getActionResponse({ error: "Access denied" });
    }

    console.log(JSON.stringify({revokeInvitation:"deleting_invitation"}));

    await db.invitation.delete({
      where: { id: invitationId },
    });

    console.log(JSON.stringify({revokeInvitation:"complete",invitationId}));

    return getActionResponse({ data: { success: true } });
  } catch (error) {
    console.log(JSON.stringify({revokeInvitation:"error",error:error instanceof Error?error.message:"unknown"}));
    return getActionResponse({ error });
  }
};