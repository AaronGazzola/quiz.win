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
  _userId: string,
  _organizationId: string,
  _resource: string,
  _action: string
) => {
  try {
    // TODO: Implement permission checking when auth.api.hasPermission is available
    // For now, return true to allow access
    return true;
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
};

export const hasOrgRole = async (
  _userId: string,
  _organizationId: string,
  _role: string
) => {
  try {
    // TODO: Implement role checking when auth.api.hasRole is available
    // For now, return true to allow access
    return true;
  } catch (error) {
    console.error("Role check failed:", error);
    return false;
  }
};