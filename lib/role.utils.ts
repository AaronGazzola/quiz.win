import { auth } from "./auth";
import { headers } from "next/headers";

export const isOrgAdmin = async (_userId: string, _organizationId: string): Promise<boolean> => {
  try {
    // TODO: Implement role checking when auth.api.hasRole is available
    // For now, return true to allow access
    return true;
  } catch (error) {
    console.error("Error checking org admin role:", error);
    return false;
  }
};

export const isOrgOwner = async (_userId: string, _organizationId: string): Promise<boolean> => {
  try {
    // TODO: Implement role checking when auth.api.hasRole is available
    // For now, return true to allow access
    return true;
  } catch (error) {
    console.error("Error checking org owner role:", error);
    return false;
  }
};

export const isSuperAdmin = async (): Promise<boolean> => {
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
  _userId: string,
  _organizationId: string
): Promise<boolean> => {
  try {
    // TODO: Implement permission checking when auth.api.hasPermission is available
    // For now, return true to allow access
    return true;
  } catch (error) {
    console.error("Error checking quiz management permission:", error);
    return false;
  }
};

export const canViewQuizzes = async (
  _userId: string,
  _organizationId: string
): Promise<boolean> => {
  try {
    // TODO: Implement permission checking when auth.api.hasPermission is available
    // For now, return true to allow access
    return true;
  } catch (error) {
    console.error("Error checking quiz view permission:", error);
    return false;
  }
};

export const canManageResponses = async (
  _userId: string,
  _organizationId: string
): Promise<boolean> => {
  try {
    // TODO: Implement permission checking when auth.api.hasPermission is available
    // For now, return true to allow access
    return true;
  } catch (error) {
    console.error("Error checking response management permission:", error);
    return false;
  }
};

export const canManageUsers = async (
  _userId: string,
  _organizationId: string
): Promise<boolean> => {
  try {
    // TODO: Implement permission checking when auth.api.hasPermission is available
    // For now, return true to allow access
    return true;
  } catch (error) {
    console.error("Error checking user management permission:", error);
    return false;
  }
};

export const getUserOrganizations = async (_userId: string) => {
  try {
    return await auth.api.listOrganizations({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return [];
  }
};

export const getUserAdminOrganizations = async (_userId: string) => {
  try {
    const allOrgs = await auth.api.listOrganizations({
      headers: await headers(),
    });

    const adminOrgs = [];
    for (const org of allOrgs) {
      // TODO: Implement role checking when auth.api.hasRole is available
      // For now, assume user is admin/owner of all orgs
      const isAdmin = true;
      const isOwner = true;
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


export const canViewUsers = async (
  _userId: string,
  _organizationId: string
): Promise<boolean> => {
  try {
    // TODO: Implement permission checking when auth.api.hasPermission is available
    // For now, return true to allow access
    return true;
  } catch (error) {
    console.error("Error checking user view permission:", error);
    return false;
  }
};