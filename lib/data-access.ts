import { getUserOrganizations, getUserAdminOrganizations } from "./role.utils";
import { auth } from "./auth";
import { headers } from "next/headers";
import { getAuthenticatedClient } from "./auth.utils";

export const getOrgScopedData = async <T>(
  _userId: string,
  organizationId: string,
  _resource: string,
  _action: string,
  queryFn: (orgId: string) => Promise<T>
): Promise<T | null> => {
  // TODO: Implement permission checking when auth.api.hasPermission is available
  // For now, allow access
  return await queryFn(organizationId);
};

export const getUserMemberOrganizations = async (userId: string) => {
  return await getUserOrganizations(userId);
};

export const getUserAdminOrganizationsData = async (userId: string) => {
  return await getUserAdminOrganizations(userId);
};

export const validateOrgAccess = async (
  userId: string,
  organizationId: string,
  action: "read" | "write" | "admin"
): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return false;
    }

    const { db } = await getAuthenticatedClient();
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (dbUser?.role === "super-admin") {
      return true;
    }

    if (action === "admin") {
      const adminOrgs = await getUserAdminOrganizations(userId);
      return adminOrgs.some(org => org.id === organizationId);
    }

    const memberOrgs = await getUserOrganizations(userId);
    const hasAccess = memberOrgs.some(org => org.id === organizationId);

    if (action === "write") {
      const adminOrgs = await getUserAdminOrganizations(userId);
      return adminOrgs.some(org => org.id === organizationId);
    }

    return hasAccess;
  } catch (error) {
    console.error("Error validating organization access:", error);
    return false;
  }
};

export const getOrgScopedQuizzes = async (
  userId: string,
  organizationId?: string
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const { db } = await getAuthenticatedClient();
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (dbUser?.role === "super-admin") {
    if (!organizationId) {
      const allOrgs = await auth.api.listOrganizations({
        headers: await headers(),
      });
      return allOrgs.map(org => org.id);
    }
    return [organizationId];
  }

  const memberOrgs = await getUserMemberOrganizations(userId);

  if (!organizationId) {
    return memberOrgs.map(org => org.id);
  }

  const hasAccess = memberOrgs.some(org => org.id === organizationId);
  if (!hasAccess) {
    throw new Error("Access denied to organization");
  }

  return [organizationId];
};

export const getOrgScopedUsers = async (
  userId: string,
  organizationId?: string
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const { db } = await getAuthenticatedClient();
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (dbUser?.role === "super-admin") {
    if (!organizationId) {
      const allOrgs = await auth.api.listOrganizations({
        headers: await headers(),
      });
      return allOrgs.map(org => org.id);
    }
    return [organizationId];
  }

  const adminOrgs = await getUserAdminOrganizationsData(userId);

  if (!organizationId) {
    return adminOrgs.map(org => org.id);
  }

  const hasAccess = adminOrgs.some(org => org.id === organizationId);
  if (!hasAccess) {
    throw new Error("Access denied to manage users in organization");
  }

  return [organizationId];
};

export const withOrgPermission = async <T>(
  userId: string,
  organizationId: string,
  resource: "quiz" | "response" | "user",
  action: "read" | "create" | "update" | "delete" | "invite",
  operation: () => Promise<T>
): Promise<T> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const { db } = await getAuthenticatedClient();
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (dbUser?.role === "super-admin") {
    return await operation();
  }

  const hasPermission = await validateOrgAccess(userId, organizationId,
    action === "read" ? "read" :
    resource === "user" || action === "invite" ? "admin" : "write"
  );

  if (!hasPermission) {
    throw new OrgAccessError(
      `Permission denied for ${action} on ${resource}`,
      organizationId,
      userId
    );
  }

  return await operation();
};

export class OrgAccessError extends Error {
  constructor(message: string, public organizationId: string, public userId: string) {
    super(message);
    this.name = "OrgAccessError";
  }
}

export const handleOrgAccessError = (error: unknown): never => {
  if (error instanceof OrgAccessError) {
    throw new Error(`Organization access denied: ${error.message}`);
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error("Unknown organization access error");
};