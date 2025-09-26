import { auth } from "./auth";
import { headers } from "next/headers";

export const isOrgAdmin = async (userId: string, organizationId: string): Promise<boolean> => {
  try {
    return await auth.api.hasRole({
      userId,
      organizationId,
      role: "admin",
      headers: await headers(),
    });
  } catch (error) {
    console.error("Error checking org admin role:", error);
    return false;
  }
};

export const isOrgOwner = async (userId: string, organizationId: string): Promise<boolean> => {
  try {
    return await auth.api.hasRole({
      userId,
      organizationId,
      role: "owner",
      headers: await headers(),
    });
  } catch (error) {
    console.error("Error checking org owner role:", error);
    return false;
  }
};

export const isSuperAdmin = async (userId: string): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session?.user?.role === "super-admin" || false;
  } catch (error) {
    console.error("Error checking super admin role:", error);
    return false;
  }
};

export const canManageQuizzes = async (
  userId: string,
  organizationId: string
): Promise<boolean> => {
  try {
    return await auth.api.hasPermission({
      userId,
      organizationId,
      resource: "quiz",
      action: "create",
      headers: await headers(),
    });
  } catch (error) {
    console.error("Error checking quiz management permission:", error);
    return false;
  }
};

export const canViewQuizzes = async (
  userId: string,
  organizationId: string
): Promise<boolean> => {
  try {
    return await auth.api.hasPermission({
      userId,
      organizationId,
      resource: "quiz",
      action: "read",
      headers: await headers(),
    });
  } catch (error) {
    console.error("Error checking quiz view permission:", error);
    return false;
  }
};

export const canManageResponses = async (
  userId: string,
  organizationId: string
): Promise<boolean> => {
  try {
    return await auth.api.hasPermission({
      userId,
      organizationId,
      resource: "response",
      action: "read",
      headers: await headers(),
    });
  } catch (error) {
    console.error("Error checking response management permission:", error);
    return false;
  }
};

export const canManageUsers = async (
  userId: string,
  organizationId: string
): Promise<boolean> => {
  try {
    return await auth.api.hasPermission({
      userId,
      organizationId,
      resource: "user",
      action: "invite",
      headers: await headers(),
    });
  } catch (error) {
    console.error("Error checking user management permission:", error);
    return false;
  }
};

export const getUserOrganizations = async (userId: string) => {
  try {
    return await auth.api.listOrganizations({
      userId,
      headers: await headers(),
    });
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return [];
  }
};

export const getUserAdminOrganizations = async (userId: string) => {
  try {
    const allOrgs = await auth.api.listOrganizations({
      userId,
      headers: await headers(),
    });

    const adminOrgs = [];
    for (const org of allOrgs) {
      const isAdmin = await auth.api.hasRole({
        userId,
        organizationId: org.id,
        role: "admin",
        headers: await headers(),
      });
      const isOwner = await auth.api.hasRole({
        userId,
        organizationId: org.id,
        role: "owner",
        headers: await headers(),
      });
      if (isAdmin || isOwner) {
        adminOrgs.push(org);
      }
    }

    return adminOrgs;
  } catch (error) {
    console.error("Error fetching user admin organizations:", error);
    return [];
  }
};

export const getOrgRoleLabel = (role: string): string => {
  switch (role) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "member":
      return "Member";
    default:
      return "Unknown";
  }
};