"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getUserAdminOrganizations, isSuperAdmin } from "@/lib/role.utils";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { headers } from "next/headers";
import { UsersData, UserWithDetails } from "./page.types";

export const getUsersAction = async (
  organizationIds?: string[],
  search?: string,
  sortColumn?: string,
  sortDirection?: "asc" | "desc",
  page?: number,
  itemsPerPage?: number
): Promise<ActionResponse<UsersData>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const isSuper = await isSuperAdmin();
    let targetOrgIds: string[] = [];

    if (isSuper) {
      if (organizationIds && organizationIds.length > 0) {
        targetOrgIds = organizationIds;
      } else {
        const allOrgs = await auth.api.listOrganizations({
          headers: await headers(),
        });
        targetOrgIds = allOrgs?.map(org => org.id) || [];
      }
    } else {
      const userAdminOrgs = await getUserAdminOrganizations(session.user.id);

      if (userAdminOrgs.length === 0) {
        return getActionResponse({ error: "Access denied" });
      }

      if (organizationIds && organizationIds.length > 0) {
        targetOrgIds = organizationIds.filter(orgId =>
          userAdminOrgs.some(adminOrg => adminOrg.id === orgId)
        );
      } else {
        targetOrgIds = userAdminOrgs.map(org => org.id);
      }
    }

    if (targetOrgIds.length === 0) {
      return getActionResponse({
        data: { users: [], totalPages: 0, totalCount: 0 }
      });
    }

    const allMembers: any[] = [];

    for (const orgId of targetOrgIds) {
      try {
        const members = await auth.api.listMembers({
          organizationId: orgId,
          headers: await headers(),
        });

        if (members) {
          allMembers.push(...members.map(member => ({
            ...member,
            organizationName: member.organization?.name || 'Unknown Organization'
          })));
        }
      } catch (error) {
        console.error(`Failed to fetch members for organization ${orgId}:`, error);
      }
    }

    let filteredMembers = allMembers;

    if (search) {
      filteredMembers = filteredMembers.filter(member =>
        member.user.name?.toLowerCase().includes(search.toLowerCase()) ||
        member.user.email?.toLowerCase().includes(search.toLowerCase()) ||
        member.organizationName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortColumn && sortDirection) {
      filteredMembers.sort((a, b) => {
        let aValue: string | Date | null = null;
        let bValue: string | Date | null = null;

        switch (sortColumn) {
          case 'name':
            aValue = a.user.name || '';
            bValue = b.user.name || '';
            break;
          case 'email':
            aValue = a.user.email || '';
            bValue = b.user.email || '';
            break;
          case 'role':
            aValue = a.role || '';
            bValue = b.role || '';
            break;
          case 'organization':
            aValue = a.organizationName || '';
            bValue = b.organizationName || '';
            break;
          case 'createdAt':
            aValue = a.user.createdAt || new Date(0);
            bValue = b.user.createdAt || new Date(0);
            break;
          default:
            aValue = a.user.createdAt || new Date(0);
            bValue = b.user.createdAt || new Date(0);
        }

        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    const take = itemsPerPage || 10;
    const skip = page && itemsPerPage ? page * itemsPerPage : 0;
    const paginatedMembers = filteredMembers.slice(skip, skip + take);
    const totalPages = Math.ceil(filteredMembers.length / take);

    return getActionResponse({
      data: {
        users: paginatedMembers.map(member => ({
          ...member.user,
          members: [member],
          _count: { members: 1 },
          organizationName: member.organizationName
        })) as UserWithDetails[],
        totalPages,
        totalCount: filteredMembers.length
      }
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const toggleUserBanAction = async (userId: string, banned: boolean, banReason?: string): Promise<ActionResponse<boolean>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const isSuper = await isSuperAdmin();

    if (isSuper) {
      if (banned) {
        await auth.api.banUser({
          userId,
          banReason,
          headers: await headers(),
        });
      } else {
        await auth.api.unbanUser({
          userId,
          headers: await headers(),
        });
      }
    } else {
      const userAdminOrgs = await getUserAdminOrganizations(session.user.id);

      if (userAdminOrgs.length === 0) {
        return getActionResponse({ error: "Access denied" });
      }

      let canManageUser = false;

      for (const org of userAdminOrgs) {
        const members = await auth.api.listMembers({
          organizationId: org.id,
          headers: await headers(),
        });

        if (members?.some(member => member.userId === userId)) {
          canManageUser = true;
          break;
        }
      }

      if (!canManageUser) {
        return getActionResponse({ error: "You can only manage users from your organizations" });
      }

      if (banned) {
        await auth.api.banUser({
          userId,
          banReason,
          headers: await headers(),
        });
      } else {
        await auth.api.unbanUser({
          userId,
          headers: await headers(),
        });
      }
    }

    return getActionResponse({ data: banned });
  } catch (error) {
    return getActionResponse({ error });
  }
};