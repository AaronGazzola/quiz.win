import { User } from "@prisma/client";

interface ExtendedUser extends User {
  members?: Array<{ role: string; organizationId: string }>;
}

export const isAdmin = (user: ExtendedUser | null): boolean => {
  if (!user) return false;
  return user.members?.some(member => member.role === 'admin') || false;
};

export const isSuperAdmin = (user: ExtendedUser | null): boolean => {
  if (!user) return false;
  return user.role === "super-admin";
};

export const isOrgAdminClient = (user: ExtendedUser | null, organizationId: string): boolean => {
  if (!user) return false;
  return user.members?.some(member =>
    member.organizationId === organizationId &&
    (member.role === 'admin' || member.role === 'owner')
  ) || false;
};

export const canInviteUsers = (user: ExtendedUser | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isAdmin(user);
};