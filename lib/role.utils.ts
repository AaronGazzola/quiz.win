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