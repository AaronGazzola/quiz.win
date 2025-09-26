"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { isSuperAdmin, isOrgAdmin } from "@/lib/role.utils";
import { Organization } from "@prisma/client";
import { signIn } from "@/lib/auth-client";

export const getOrganizationsAction = async (): Promise<ActionResponse<Organization[]>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const prismaUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        members: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!prismaUser) {
      return getActionResponse({ error: "User not found" });
    }

    let organizations: Organization[];

    if (isSuperAdmin(prismaUser)) {
      organizations = await db.organization.findMany({
        orderBy: { name: 'asc' }
      });
    } else {
      const userOrgIds = prismaUser.members
        .filter(member => member.role === 'admin')
        .map(member => member.organizationId);

      organizations = await db.organization.findMany({
        where: {
          id: { in: userOrgIds }
        },
        orderBy: { name: 'asc' }
      });
    }

    return getActionResponse({ data: organizations });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const createOrganizationAction = async (name: string): Promise<ActionResponse<Organization>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const prismaUser = await db.user.findUnique({
      where: { id: user.id },
      include: { members: true }
    });

    if (!prismaUser || !isSuperAdmin(prismaUser)) {
      return getActionResponse({ error: "Only super admins can create organizations" });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existingOrg = await db.organization.findUnique({
      where: { slug }
    });

    if (existingOrg) {
      return getActionResponse({ error: "Organization with this name already exists" });
    }

    const organization = await db.organization.create({
      data: {
        name,
        slug
      }
    });

    return getActionResponse({ data: organization });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const sendInvitationsAction = async (
  emails: string[],
  role: "org-admin" | "member",
  organizationId: string
): Promise<ActionResponse<number>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const prismaUser = await db.user.findUnique({
      where: { id: user.id },
      include: { members: true }
    });

    if (!prismaUser) {
      return getActionResponse({ error: "User not found" });
    }

    const organization = await db.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return getActionResponse({ error: "Organization not found" });
    }

    if (!isSuperAdmin(prismaUser) && !isOrgAdmin(prismaUser, organizationId)) {
      return getActionResponse({ error: "You don't have permission to invite users to this organization" });
    }

    const validEmails = emails.filter(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    });

    if (validEmails.length === 0) {
      return getActionResponse({ error: "No valid email addresses provided" });
    }

    const existingUsers = await db.user.findMany({
      where: {
        email: { in: validEmails },
        members: {
          some: {
            organizationId,
          }
        }
      }
    });

    const existingEmails = existingUsers.map(user => user.email);
    const newEmails = validEmails.filter(email => !existingEmails.includes(email));

    if (newEmails.length === 0) {
      return getActionResponse({ error: "All provided emails are already members of this organization" });
    }

    const invitationData = {
      organizationId,
      organizationName: organization.name,
      role: role === "org-admin" ? "admin" : "member",
      inviterName: prismaUser.name || prismaUser.email
    };

    const callbackUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard?invitation=${encodeURIComponent(JSON.stringify(invitationData))}`;

    let sentCount = 0;
    for (const email of newEmails) {
      try {
        await signIn.magicLink({
          email: email.trim(),
          callbackURL: callbackUrl,
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send invitation to ${email}:`, error);
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