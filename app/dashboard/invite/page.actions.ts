"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getUserAdminOrganizations, isSuperAdmin } from "@/lib/role.utils";
import { headers } from "next/headers";

export const getOrganizationsAction = async (): Promise<ActionResponse<Array<{id: string; name: string; slug: string}>>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    let organizations;

    if (await isSuperAdmin(session.user.id)) {
      organizations = await auth.api.listOrganizations({
        userId: session.user.id,
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

export const createOrganizationAction = async (name: string): Promise<ActionResponse<{id: string; name: string; slug: string}>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    if (!(await isSuperAdmin(session.user.id))) {
      return getActionResponse({ error: "Only super admins can create organizations" });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const organization = await auth.api.createOrganization({
      userId: session.user.id,
      name,
      slug,
      headers: await headers(),
    });

    return getActionResponse({ data: organization });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const sendInvitationsAction = async (
  emails: string[],
  role: "admin" | "member",
  organizationId: string
): Promise<ActionResponse<number>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const canManageUsers = await auth.api.hasPermission({
      userId: session.user.id,
      organizationId,
      resource: "user",
      action: "invite",
      headers: await headers(),
    });

    if (!canManageUsers) {
      return getActionResponse({ error: "You don't have permission to invite users to this organization" });
    }

    const validEmails = emails.filter(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    });

    if (validEmails.length === 0) {
      return getActionResponse({ error: "No valid email addresses provided" });
    }

    let sentCount = 0;
    for (const email of validEmails) {
      try {
        await auth.api.inviteToOrganization({
          userId: session.user.id,
          organizationId,
          email: email.trim(),
          role,
          headers: await headers(),
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send invitation to ${email}:`, JSON.stringify(error));
      }
    }

    if (sentCount === 0) {
      return getActionResponse({ error: "Failed to send any invitations" });
    }

    return getActionResponse({ data: sentCount });
  } catch (error) {
    return getActionResponse({ error });
  }
};