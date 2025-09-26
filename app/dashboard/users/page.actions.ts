"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getUserAdminOrganizations, isSuperAdmin } from "@/lib/role.utils";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { headers } from "next/headers";
import { UsersData, UserWithDetails } from "./page.types";

export const getUsersAction = async (
  organizationId?: string,
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

    const { db } = await getAuthenticatedClient();
    const isSuper = await isSuperAdmin();
    const userAdminOrgs = await getUserAdminOrganizations(session.user.id);

    if (!isSuper && userAdminOrgs.length === 0) {
      return getActionResponse({ error: "Access denied" });
    }

    let userFilter: Record<string, unknown> = {};

    const adminOrgIds = userAdminOrgs.map(org => org.id);

    if (!isSuper) {
      if (organizationId && adminOrgIds.includes(organizationId)) {
        userFilter = {
          members: {
            some: {
              organizationId: organizationId
            }
          }
        };
      } else {
        userFilter = {
          members: {
            some: {
              organizationId: { in: adminOrgIds }
            }
          }
        };
      }
    } else if (organizationId) {
      userFilter = {
        members: {
          some: {
            organizationId: organizationId
          }
        }
      };
    }

    if (search) {
      userFilter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };

    if (sortColumn && sortDirection) {
      switch (sortColumn) {
        case 'name':
          orderBy = { name: sortDirection };
          break;
        case 'email':
          orderBy = { email: sortDirection };
          break;
        case 'role':
          orderBy = { role: sortDirection };
          break;
        case 'createdAt':
          orderBy = { createdAt: sortDirection };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    }

    const skip = page && itemsPerPage ? page * itemsPerPage : 0;
    const take = itemsPerPage || 10;

    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where: userFilter,
        include: {
          members: {
            include: {
              organization: true
            }
          },
          _count: {
            select: {
              members: true
            }
          }
        },
        orderBy,
        skip,
        take
      }),
      db.user.count({
        where: userFilter
      })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    return getActionResponse({
      data: {
        users: users as UserWithDetails[],
        totalPages,
        totalCount
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

    const { db } = await getAuthenticatedClient();
    const isSuper = await isSuperAdmin();

    if (!isSuper) {
      const targetUser = await db.user.findUnique({
        where: { id: userId },
        include: { members: true }
      });

      if (!targetUser) {
        return getActionResponse({ error: "Target user not found" });
      }

      const userAdminOrgs = await getUserAdminOrganizations(session.user.id);
      const adminOrgIds = userAdminOrgs.map(org => org.id);
      const targetUserOrgs = targetUser.members.map(member => member.organizationId);

      const hasSharedOrg = adminOrgIds.some(orgId => targetUserOrgs.includes(orgId));

      if (!hasSharedOrg) {
        return getActionResponse({ error: "You can only manage users from your organizations" });
      }
    }

    await db.user.update({
      where: { id: userId },
      data: {
        banned,
        banReason: banned ? banReason : null,
        banExpires: null
      }
    });

    return getActionResponse({ data: banned });
  } catch (error) {
    return getActionResponse({ error });
  }
};