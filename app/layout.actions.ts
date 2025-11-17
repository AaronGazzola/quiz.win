"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { isSuperAdmin } from "@/lib/role.utils";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
import { headers } from "next/headers";
import { user } from "@prisma/client";
import { ExtendedUser } from "./layout.types";

export const getUserAction = async (): Promise<ActionResponse<user | null>> => {
  try {

    const session = await auth.api.getSession({
      headers: await headers(),
    });


    if (!session?.user) {
      return getActionResponse();
    }

    const { db } = await getAuthenticatedClient();

    const prismaUser = await db.user.findUnique({
      where: { id: session.user.id },
    });


    if (!prismaUser) {
      return getActionResponse();
    }

    return getActionResponse({ data: prismaUser });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getUserMembersAction = async (): Promise<ActionResponse<ExtendedUser | null>> => {
  try {
    conditionalLog({ action: "getUserMembersAction", status: "start" }, { label: LOG_LABELS.DATA_FETCH });

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    conditionalLog({ action: "getUserMembersAction", status: "session_fetched", hasSession: !!session, hasUser: !!session?.user, userId: session?.user?.id }, { label: LOG_LABELS.DATA_FETCH });

    if (!session?.user) {
      conditionalLog({ action: "getUserMembersAction", status: "no_session", returning: "empty" }, { label: LOG_LABELS.DATA_FETCH });
      return getActionResponse();
    }

    const { db } = await getAuthenticatedClient();
    conditionalLog({ action: "getUserMembersAction", status: "db_client_obtained" }, { label: LOG_LABELS.DATA_FETCH });

    const prismaUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        member: {
          include: {
            organization: true,
          },
        },
      },
    });

    conditionalLog({ action: "getUserMembersAction", status: "user_fetched", userFound: !!prismaUser, userId: prismaUser?.id, memberCount: prismaUser?.member?.length }, { label: LOG_LABELS.DATA_FETCH });

    if (!prismaUser) {
      conditionalLog({ action: "getUserMembersAction", status: "no_prisma_user", returning: "empty" }, { label: LOG_LABELS.DATA_FETCH });
      return getActionResponse();
    }

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });
    conditionalLog({ action: "getUserMembersAction", status: "profile_fetched", profileFound: !!profile }, { label: LOG_LABELS.DATA_FETCH });

    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    conditionalLog({ action: "getUserMembersAction", status: "role_fetched", role: dbUser?.role }, { label: LOG_LABELS.DATA_FETCH });

    if (dbUser?.role === "super-admin") {
      conditionalLog({ action: "getUserMembersAction", status: "super_admin_detected", fetching: "all_organizations" }, { label: LOG_LABELS.DATA_FETCH });
      const allOrganizations = await db.organization.findMany({
        orderBy: { name: 'asc' }
      });

      conditionalLog({ action: "getUserMembersAction", status: "organizations_fetched", count: allOrganizations.length }, { label: LOG_LABELS.DATA_FETCH });

      const syntheticMembers = allOrganizations.map((org) => ({
        id: `synthetic-${org.id}`,
        userId: session.user.id,
        organizationId: org.id,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        organization: org,
      }));

      const userWithProfileAndmember = {
        ...prismaUser,
        member: syntheticMembers,
        profile,
      };

      conditionalLog({ action: "getUserMembersAction", status: "success_super_admin", userId: userWithProfileAndmember.id, syntheticMemberCount: syntheticMembers.length }, { label: LOG_LABELS.DATA_FETCH });
      return getActionResponse({ data: userWithProfileAndmember });
    }

    const userWithProfileAndmember = {
      ...prismaUser,
      profile,
    };

    conditionalLog({ action: "getUserMembersAction", status: "success_regular_user", userId: userWithProfileAndmember.id, memberCount: prismaUser.member?.length }, { label: LOG_LABELS.DATA_FETCH });
    return getActionResponse({ data: userWithProfileAndmember });
  } catch (error) {
    conditionalLog({ action: "getUserMembersAction", status: "error", error }, { label: LOG_LABELS.DATA_FETCH });
    return getActionResponse({ error });
  }
};


export const createOrganizationAction = async (name: string): Promise<ActionResponse<{id: string; name: string; slug: string} | null>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    if (!(await isSuperAdmin())) {
      return getActionResponse({ error: "Only super admins can create organizations" });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const organization = await db.organization.create({
      data: {
        name,
        slug,
      },
    });

    return getActionResponse({
      data: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      }
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};