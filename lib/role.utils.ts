import { auth } from "./auth";
import { headers } from "next/headers";

interface OrganizationWithRole {
  id: string;
  name: string;
  slug: string;
  role: string;
  createdAt: Date;
  logo?: string | null;
  metadata?: Record<string, unknown>;
}

export const isOrgAdmin = async (userId: string, organizationId: string): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.role === "super-admin") {
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

    if (session?.user?.role === "super-admin") {
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.role === "super-admin") {
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

    if (session?.user?.role === "super-admin") {
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

    if (session?.user?.role === "super-admin") {
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

    if (session?.user?.role === "super-admin") {
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

    if (session?.user?.role === "super-admin") {
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

    if (session?.user?.role === "super-admin") {
      return true;
    }

    return await isOrgAdmin(userId, organizationId);
  } catch (error) {
    console.error("Error checking user view permission:", error);
    return false;
  }
};

export const isSchoolAdmin = async (userId: string, campusId: string): Promise<boolean> => {
  return await isOrgAdmin(userId, campusId);
};

export const canManageTeachers = async (userId: string, campusId: string): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.role === "super-admin") {
      return true;
    }

    return await isOrgAdmin(userId, campusId);
  } catch (error) {
    console.error("Error checking teacher management permission:", error);
    return false;
  }
};

export const canManageStudents = async (userId: string, campusId: string): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.role === "super-admin") {
      return true;
    }

    return await isOrgAdmin(userId, campusId);
  } catch (error) {
    console.error("Error checking student management permission:", error);
    return false;
  }
};

export const canViewStudentDetails = async (userId: string, studentId: string, campusId: string): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.role === "super-admin") {
      return true;
    }

    if (await isOrgAdmin(userId, campusId)) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking student view permission:", error);
    return false;
  }
};

export const isTeacherInCampus = async (userId: string, campusId: string): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.role === "super-admin") {
      return true;
    }

    const userOrgs = await getUserOrganizations(userId);
    return userOrgs.some(org => org.id === campusId);
  } catch (error) {
    console.error("Error checking teacher campus assignment:", error);
    return false;
  }
};

export const isParentOfStudent = async (userId: string, studentId: string): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.role === "super-admin") {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking parent-student relationship:", error);
    return false;
  }
};