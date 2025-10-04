"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { isSuperAdmin } from "@/lib/role.utils";
import { headers } from "next/headers";
import { User, Profile } from "@prisma/client";
import { ExtendedUser } from "./layout.types";

export const getUserAction = async (): Promise<ActionResponse<User | null>> => {
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

    const session = await auth.api.getSession({
      headers: await headers(),
    });


    if (!session?.user) {
      return getActionResponse();
    }

    const { db } = await getAuthenticatedClient();

    const prismaUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        members: {
          include: {
            organization: true,
          },
        },
      },
    });


    if (!prismaUser) {
      return getActionResponse();
    }

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (session.user.role === "super-admin") {
      const allOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
      });

      const syntheticMembers = allOrganizations.map((org) => ({
        id: `synthetic-${org.id}`,
        userId: session.user.id,
        organizationId: org.id,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        organization: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          logo: org.logo || null,
          metadata: org.metadata || null,
          createdAt: org.createdAt,
          updatedAt: new Date(),
          phone: null,
          address: null,
          capacity: null,
          location: null,
          principalName: null,
        },
      }));

      const userWithProfileAndMembers = {
        ...prismaUser,
        members: syntheticMembers,
        profile,
      };

      return getActionResponse({ data: userWithProfileAndMembers });
    }

    const userWithProfileAndMembers = {
      ...prismaUser,
      profile,
    };

    return getActionResponse({ data: userWithProfileAndMembers });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getUserProfileAction = async (): Promise<ActionResponse<Profile | null>> => {
  try {

    const session = await auth.api.getSession({
      headers: await headers(),
    });


    if (!session?.user) {
      return getActionResponse();
    }

    const { db } = await getAuthenticatedClient();

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });


    return getActionResponse({ data: profile });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getAllOrganizationsAction = async (): Promise<ActionResponse<Array<{id: string; name: string; slug: string; logo: string | null; metadata: unknown; createdAt: Date; updatedAt: Date}> | null>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    if (!(await isSuperAdmin())) {
      return getActionResponse({ error: "Only super admins can access all organizations" });
    }

    const { db } = await getAuthenticatedClient();

    const organizations = await db.organization.findMany({
      orderBy: { name: 'asc' }
    });

    return getActionResponse({ data: organizations });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const createOrganizationAction = async (name: string): Promise<ActionResponse<{id: string; name: string; slug: string} | null>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    if (!(await isSuperAdmin())) {
      return getActionResponse({ error: "Only super admins can create organizations" });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const organization = await auth.api.createOrganization({
      body: {
        name,
        slug,
      },
      headers: await headers(),
    });

    return getActionResponse({
      data: organization ? {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      } : null
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};