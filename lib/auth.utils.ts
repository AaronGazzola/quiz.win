import { PrismaClient } from "@prisma/client";
import { auth } from "./auth";
import { headers } from "next/headers";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const getAuthenticatedClient = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    db: prisma,
    user: session?.user || null,
    session: session || null,
  };
};

export const getAuthenticatedClientWithOrgs = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      db: prisma,
      user: null,
      session: null,
      organizations: [],
    };
  }

  const organizations = await auth.api.listOrganizations({
    userId: session.user.id,
    headers: await headers(),
  });

  return {
    db: prisma,
    user: session.user,
    session,
    organizations: organizations || [],
  };
};

export const hasOrgPermission = async (
  userId: string,
  organizationId: string,
  resource: string,
  action: string
) => {
  try {
    return await auth.api.hasPermission({
      userId,
      organizationId,
      resource,
      action,
      headers: await headers(),
    });
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
};

export const hasOrgRole = async (
  userId: string,
  organizationId: string,
  role: string
) => {
  try {
    return await auth.api.hasRole({
      userId,
      organizationId,
      role,
      headers: await headers(),
    });
  } catch (error) {
    console.error("Role check failed:", error);
    return false;
  }
};