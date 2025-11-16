import { auth } from "./auth";
import { headers } from "next/headers";
import { getAuthenticatedClient } from "./auth.utils";

interface OrganizationWithRole {
  id: string;
  name: string;
  slug: string;
  role: string;
  createdAt: Date;
  logo?: string | null;
  metadata?: Record<string, unknown>;
}

const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    const { db } = await getAuthenticatedClient();
    const dbUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    return dbUser?.role ?? null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};

export const isOrgAdmin = async (userId: string, organizationId: string): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return false;
    }

    const userRole = await getUserRole(session.user.id);
    if (userRole === "super-admin") {
      return true;
    }

    const adminOrgs = await getUserAdminOrganizations(userId);
    return adminOrgs.some(org => org.id === organizationId);
  } catch (error) {
    console.error("Error checking org admin role:", error);
    return false;
  }
};

export const isOrgOwner = async (userId: string, organizationId: string): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return false;
    }

    const userRole = await getUserRole(session.user.id);
    if (userRole === "super-admin") {
      return true;
    }

    const allOrgs = await auth.api.listOrganizations({
      headers: await headers(),
    });

    return allOrgs.some((org) =>
      org.id === organizationId && (org as OrganizationWithRole).role === "owner"
    );
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

    if (!session?.user) {
      return false;
    }

    const userRole = await getUserRole(session.user.id);
    return userRole === "super-admin";
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return false;
    }

    const userRole = await getUserRole(session.user.id);
    if (userRole === "super-admin") {
      return true;
    }

    return await isOrgAdmin(userId, organizationId);
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return false;
    }

    const userRole = await getUserRole(session.user.id);
    if (userRole === "super-admin") {
      return true;
    }

    const userOrgs = await getUserOrganizations(userId);
    return userOrgs.some(org => org.id === organizationId);
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return false;
    }

    const userRole = await getUserRole(session.user.id);
    if (userRole === "super-admin") {
      return true;
    }

    return await isOrgAdmin(userId, organizationId);
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return false;
    }

    const userRole = await getUserRole(session.user.id);
    if (userRole === "super-admin") {
      return true;
    }

    return await isOrgAdmin(userId, organizationId);
  } catch (error) {
    console.error("Error checking user management permission:", error);
    return false;
  }
};

export const getUserOrganizations = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId: string
) => {
  try {
    return await auth.api.listOrganizations({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return [];
  }
};

export const getUserAdminOrganizations = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId: string
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return [];
    }

    const userRole = await getUserRole(session.user.id);
    if (userRole === "super-admin") {
      return await auth.api.listOrganizations({
        headers: await headers(),
      });
    }

    const allOrgs = await auth.api.listOrganizations({
      headers: await headers(),
    });

    return allOrgs.filter((org) =>
      (org as OrganizationWithRole).role === "admin" || (org as OrganizationWithRole).role === "owner"
    );
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
  userId: string,
  organizationId: string
): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return false;
    }

    const userRole = await getUserRole(session.user.id);
    if (userRole === "super-admin") {
      return true;
    }

    return await isOrgAdmin(userId, organizationId);
  } catch (error) {
    console.error("Error checking user view permission:", error);
    return false;
  }
};