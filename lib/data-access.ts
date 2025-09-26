import { auth } from "./auth";
import { headers } from "next/headers";
import { getUserOrganizations, getUserAdminOrganizations } from "./role.utils";

export const getOrgScopedData = async <T>(
  userId: string,
  organizationId: string,
  resource: string,
  action: string,
  queryFn: (orgId: string) => Promise<T>
): Promise<T | null> => {
  const hasAccess = await auth.api.hasPermission({
    userId,
    organizationId,
    resource,
    action,
    headers: await headers(),
  });

  if (!hasAccess) {
    throw new Error("Insufficient permissions");
  }

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
  const hasPermission = await auth.api.hasPermission({
    userId,
    organizationId,
    resource,
    action,
    headers: await headers(),
  });

  if (!hasPermission) {
    throw new Error(`Permission denied: Cannot ${action} ${resource} in organization`);
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