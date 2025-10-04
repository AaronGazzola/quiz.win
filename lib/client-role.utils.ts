import { user } from "@prisma/client";

interface ExtendedUser extends user {
  member?: Array<{ role: string; organizationId: string }>;
}

export const isAdmin = (user: ExtendedUser | null): boolean => {
  if (!user) return false;
  return user.member?.some(memberItem => memberItem.role === 'admin') || false;
};

export const isSuperAdmin = (user: ExtendedUser | null): boolean => {
  if (!user) return false;
  return user.role === "super-admin";
};

export const isOrgAdminClient = (user: ExtendedUser | null, organizationId: string): boolean => {
  if (!user) return false;
  return user.member?.some(memberItem =>
    memberItem.organizationId === organizationId &&
    (memberItem.role === 'admin' || memberItem.role === 'owner')
  ) || false;
};

export const canInviteUsers = (user: ExtendedUser | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isAdmin(user);
};

export const isAdminOfAllSelectedOrgs = (user: ExtendedUser | null, selectedOrganizationIds: string[]): boolean => {
  if (!user) return false;
  if (selectedOrganizationIds.length === 0) return false;

  return selectedOrganizationIds.every(orgId =>
    user.member?.some(memberItem =>
      memberItem.organizationId === orgId &&
      (memberItem.role === 'admin' || memberItem.role === 'owner')
    )
  );
};

export const canAccessAdminUI = (user: ExtendedUser | null, selectedOrganizationIds: string[]): boolean => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (selectedOrganizationIds.length === 0) return false;

  return isAdminOfAllSelectedOrgs(user, selectedOrganizationIds);
};

export const getAdminStatusByOrganization = (user: ExtendedUser | null): Record<string, boolean> => {
  if (!user || !user.member) return {};

  const adminStatus: Record<string, boolean> = {};
  user.member.forEach(memberItem => {
    adminStatus[memberItem.organizationId] = memberItem.role === 'admin' || memberItem.role === 'owner';
  });

  return adminStatus;
};

export const hasPartialAdminAccess = (user: ExtendedUser | null, selectedOrganizationIds: string[]): boolean => {
  if (!user || selectedOrganizationIds.length === 0) return false;
  if (isSuperAdmin(user)) return false;

  const adminOrgs = selectedOrganizationIds.filter(orgId =>
    user.member?.some(memberItem =>
      memberItem.organizationId === orgId &&
      (memberItem.role === 'admin' || memberItem.role === 'owner')
    )
  );

  return adminOrgs.length > 0 && adminOrgs.length < selectedOrganizationIds.length;
};