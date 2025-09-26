import { roles, UserRole } from "@/configuration";
import { ExtendedUser } from "@/app/layout.types";

export const isAdmin = (user: ExtendedUser | null): boolean => {
  if (!user) return false;
  return user.role === roles.ADMIN || user.role === roles.SUPER_ADMIN;
};

export const isSuperAdmin = (user: ExtendedUser | null): boolean => {
  if (!user) return false;
  return user.role === roles.SUPER_ADMIN;
};

export const isOrgAdmin = (user: ExtendedUser | null, organizationId?: string): boolean => {
  if (!user || !organizationId) return false;
  if (isSuperAdmin(user)) return true;

  return user.members?.some(
    member => member.organizationId === organizationId && member.role === "admin"
  ) || false;
};

export const hasRole = (user: ExtendedUser | null, requiredRole: UserRole): boolean => {
  if (!user) return false;

  switch (requiredRole) {
    case roles.USER:
      return true;
    case roles.ADMIN:
      return isAdmin(user);
    case roles.SUPER_ADMIN:
      return isSuperAdmin(user);
    default:
      return false;
  }
};

export const canManageContent = (user: ExtendedUser | null, organizationId?: string): boolean => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (!organizationId) return false;

  return isOrgAdmin(user, organizationId);
};

export const canViewContent = (user: ExtendedUser | null, organizationId?: string): boolean => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (!organizationId) return true;

  return user.members?.some(
    member => member.organizationId === organizationId
  ) || false;
};

export const canManageUsers = (user: ExtendedUser | null, targetOrganizationId?: string): boolean => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (!targetOrganizationId) return false;

  return isOrgAdmin(user, targetOrganizationId);
};

export const getUserOrganizations = (user: ExtendedUser | null): string[] => {
  if (!user || !user.members) return [];
  return user.members.map(member => member.organizationId);
};

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case roles.USER:
      return "User";
    case roles.ADMIN:
      return "Admin";
    case roles.SUPER_ADMIN:
      return "Super Admin";
    default:
      return "Unknown";
  }
};