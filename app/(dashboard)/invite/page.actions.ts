"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getUserAdminOrganizations, isSuperAdmin } from "@/lib/role.utils";
import { headers } from "next/headers";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
import { getAuthenticatedClient } from "@/lib/auth.utils";

export const getOrganizationsAction = async (): Promise<ActionResponse<Array<{id: string; name: string; slug: string}>>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    let organizations;

    if (await isSuperAdmin()) {
      organizations = await auth.api.listOrganizations({
        headers: await headers(),
      });
    } else {
      organizations = await getUserAdminOrganizations(session.user.id);
    }

    return getActionResponse({ data: organizations || [] });
  } catch (error) {
    return getActionResponse({ error });
  }
};

interface SendInvitationsResult {
  invited: number;
  failed: number;
  existing: number;
  errors: Array<{ email: string; error: string }>;
}

export const sendInvitationsAction = async (data: {
  emails: string[];
  role: "admin" | "member";
  organizationId: string;
}): Promise<ActionResponse<SendInvitationsResult>> => {
  conditionalLog({ action: "sendInvitationsAction", status: "start", emailCount: data.emails.length, organizationId: data.organizationId, role: data.role }, { label: LOG_LABELS.API });

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      conditionalLog({ action: "sendInvitationsAction", status: "error", error: "Unauthorized" }, { label: LOG_LABELS.API });
      return getActionResponse({ error: "Unauthorized" });
    }

    conditionalLog({ action: "sendInvitationsAction", status: "authenticated", userId: session.user.id }, { label: LOG_LABELS.API });

    const { db } = await getAuthenticatedClient();

    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const userMembership = await db.member.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: data.organizationId,
        },
      },
    });

    const isAdmin = userMembership?.role === "admin" || userMembership?.role === "owner";
    const isSuperAdminUser = dbUser?.role === "super-admin";

    conditionalLog({ action: "sendInvitationsAction", status: "permission-check", isAdmin, isSuperAdmin: isSuperAdminUser }, { label: LOG_LABELS.API });

    if (!isAdmin && !isSuperAdminUser) {
      conditionalLog({ action: "sendInvitationsAction", status: "error", error: "Access denied" }, { label: LOG_LABELS.API });
      return getActionResponse({ error: "Access denied" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = data.emails.filter(email => emailRegex.test(email));

    if (validEmails.length === 0) {
      conditionalLog({ action: "sendInvitationsAction", status: "error", error: "No valid emails" }, { label: LOG_LABELS.API });
      return getActionResponse({ error: "No valid email addresses provided" });
    }

    conditionalLog({ action: "sendInvitationsAction", status: "processing", validEmailCount: validEmails.length }, { label: LOG_LABELS.API });

    let invited = 0;
    let failed = 0;
    let existing = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (const email of validEmails) {
      conditionalLog({ action: "sendInvitationsAction", status: "processing-email", email }, { label: LOG_LABELS.API });

      try {
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
            conditionalLog({ action: "sendInvitationsAction", status: "user-already-member", email }, { label: LOG_LABELS.API });
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
          conditionalLog({ action: "sendInvitationsAction", status: "invitation-exists", email }, { label: LOG_LABELS.API });
          existing++;
          continue;
        }

        conditionalLog({ action: "sendInvitationsAction", status: "creating-invitation", email }, { label: LOG_LABELS.API });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const createdInvitation = await db.invitation.create({
          data: {
            email,
            organizationId: data.organizationId,
            role: data.role,
            inviterId: session.user.id,
            expiresAt,
            status: "pending",
          },
        });

        conditionalLog({ action: "sendInvitationsAction", status: "invitation-created", email, invitationId: createdInvitation.id }, { label: LOG_LABELS.API });
        invited++;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        conditionalLog({ action: "sendInvitationsAction", status: "email-error", email, error: errorMessage }, { label: LOG_LABELS.API });
        errors.push({ email, error: errorMessage });
        failed++;
      }
    }

    const result = {
      invited,
      failed,
      existing,
      errors,
    };

    conditionalLog({ action: "sendInvitationsAction", status: "complete", result }, { label: LOG_LABELS.API });

    if (invited === 0 && failed > 0) {
      return getActionResponse({ error: `Failed to send all invitations. Errors: ${errors.map(e => `${e.email}: ${e.error}`).join(", ")}` });
    }

    return getActionResponse({ data: result });
  } catch (error) {
    conditionalLog({ action: "sendInvitationsAction", status: "fatal-error", error }, { label: LOG_LABELS.API });
    return getActionResponse({ error });
  }
};


