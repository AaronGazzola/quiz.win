"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { isSuperAdmin } from "@/lib/role.utils";
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

    const { db } = await getAuthenticatedClient();
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
      const userAdminMemberships = await db.member.findMany({
        where: {
          userId: session.user.id,
          role: { in: ["admin", "owner"] }
        },
        select: { organizationId: true }
      });

      const userAdminOrgIds = userAdminMemberships.map(m => m.organizationId);

      if (userAdminOrgIds.length === 0) {
        return getActionResponse({
          data: { users: [], totalPages: 0, totalCount: 0 }
        });
      }

      if (organizationIds && organizationIds.length > 0) {
        targetOrgIds = organizationIds.filter(orgId => userAdminOrgIds.includes(orgId));
      } else {
        targetOrgIds = userAdminOrgIds;
      }
    }

    if (targetOrgIds.length === 0) {
      return getActionResponse({
        data: { users: [], totalPages: 0, totalCount: 0 }
      });
    }

    const allMembers = await db.member.findMany({
      where: {
        organizationId: { in: targetOrgIds }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            banned: true,
            banReason: true,
            banExpires: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            image: true,
            emergencyContact: true,
            phone: true,
            userType: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            metadata: true,
            createdAt: true,
            updatedAt: true,
            phone: true,
            address: true,
            capacity: true,
            location: true,
            principalName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let filteredMembers = allMembers;

    if (search) {
      filteredMembers = filteredMembers.filter(member =>
        member.user.name?.toLowerCase().includes(search.toLowerCase()) ||
        member.user.email?.toLowerCase().includes(search.toLowerCase()) ||
        member.organization.name?.toLowerCase().includes(search.toLowerCase())
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
            aValue = a.organization.name || '';
            bValue = b.organization.name || '';
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

    const userMap = new Map<string, UserWithDetails>();

    filteredMembers.forEach(member => {
      const userId = member.user.id;
      if (userMap.has(userId)) {
        const existingUser = userMap.get(userId)!;
        existingUser.member.push(member);
        existingUser._count.member += 1;
      } else {
        userMap.set(userId, {
          ...member.user,
          member: [member],
          _count: { member: 1 },
        });
      }
    });

    const uniqueUsers = Array.from(userMap.values());
    const take = itemsPerPage || 10;
    const skip = page && itemsPerPage ? page * itemsPerPage : 0;
    const paginatedUsers = uniqueUsers.slice(skip, skip + take);
    const totalPages = Math.ceil(uniqueUsers.length / take);

    return getActionResponse({
      data: {
        users: paginatedUsers,
        totalPages,
        totalCount: uniqueUsers.length
      }
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const changeUserRoleAction = async (
  userId: string,
  organizationId: string,
  newRole: string
): Promise<ActionResponse<boolean>> => {
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
      const userAdminMembership = await db.member.findFirst({
        where: {
          userId: session.user.id,
          organizationId,
          role: { in: ["admin", "owner"] }
        }
      });

      if (!userAdminMembership) {
        return getActionResponse({ error: "You can only manage roles in organizations you admin" });
      }
    }

    const targetMember = await db.member.findFirst({
      where: {
        userId: userId,
        organizationId
      }
    });

    if (!targetMember) {
      return getActionResponse({ error: "Member not found" });
    }

    await auth.api.updateMemberRole({
      body: {
        memberId: targetMember.id,
        organizationId,
        role: newRole,
      },
      headers: await headers(),
    });

    return getActionResponse({ data: true });
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
          body: {
            userId,
            banReason,
          },
          headers: await headers(),
        });
      } else {
        await auth.api.unbanUser({
          body: {
            userId,
          },
          headers: await headers(),
        });
      }
    } else {
      const { db } = await getAuthenticatedClient();

      const userAdminMemberships = await db.member.findMany({
        where: {
          userId: session.user.id,
          role: { in: ["admin", "owner"] }
        },
        select: { organizationId: true }
      });

      if (userAdminMemberships.length === 0) {
        return getActionResponse({ error: "Access denied" });
      }

      const userAdminOrgIds = userAdminMemberships.map(m => m.organizationId);

      const targetUserMembership = await db.member.findFirst({
        where: {
          userId,
          organizationId: { in: userAdminOrgIds }
        }
      });

      if (!targetUserMembership) {
        return getActionResponse({ error: "You can only manage users from your organizations" });
      }

      if (banned) {
        await auth.api.banUser({
          body: {
            userId,
            banReason,
          },
          headers: await headers(),
        });
      } else {
        await auth.api.unbanUser({
          body: {
            userId,
          },
          headers: await headers(),
        });
      }
    }

    return getActionResponse({ data: banned });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const bulkToggleUserBanAction = async (
  userIds: string[],
  banned: boolean,
  banReason?: string
): Promise<ActionResponse<number>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const { db } = await getAuthenticatedClient();
    const isSuper = await isSuperAdmin();
    let successCount = 0;

    let manageableUserIds = userIds;

    if (!isSuper) {
      const userAdminMemberships = await db.member.findMany({
        where: {
          userId: session.user.id,
          role: { in: ["admin", "owner"] }
        },
        select: { organizationId: true }
      });

      if (userAdminMemberships.length === 0) {
        return getActionResponse({ data: 0 });
      }

      const userAdminOrgIds = userAdminMemberships.map(m => m.organizationId);

      const manageableUsers = await db.member.findMany({
        where: {
          userId: { in: userIds },
          organizationId: { in: userAdminOrgIds }
        },
        select: { userId: true },
        distinct: ["userId"]
      });

      manageableUserIds = manageableUsers.map(m => m.userId);
    }

    for (const userId of manageableUserIds) {
      try {

        if (banned) {
          await auth.api.banUser({
            body: {
              userId,
              banReason,
            },
            headers: await headers(),
          });
        } else {
          await auth.api.unbanUser({
            body: {
              userId,
            },
            headers: await headers(),
          });
        }

        successCount++;
      } catch (error) {
        console.error(`Failed to ${banned ? 'ban' : 'unban'} user ${userId}:`, error);
      }
    }

    return getActionResponse({ data: successCount });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const updateMultipleUserRolesAction = async (
  userId: string,
  roleChanges: { organizationId: string; newRole: string }[]
): Promise<ActionResponse<number>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const { db } = await getAuthenticatedClient();
    const isSuper = await isSuperAdmin();
    let successCount = 0;

    for (const change of roleChanges) {
      try {
        if (!isSuper) {
          const userAdminMembership = await db.member.findFirst({
            where: {
              userId: session.user.id,
              organizationId: change.organizationId,
              role: { in: ["admin", "owner"] }
            }
          });

          if (!userAdminMembership) {
            console.error(`User does not have admin access to organization ${change.organizationId}`);
            continue;
          }
        }

        const targetMember = await db.member.findFirst({
          where: {
            userId: userId,
            organizationId: change.organizationId
          }
        });

        if (!targetMember) {
          console.error(`Member not found for user ${userId} in organization ${change.organizationId}`);
          continue;
        }

        await auth.api.updateMemberRole({
          body: {
            memberId: targetMember.id,
            organizationId: change.organizationId,
            role: change.newRole,
          },
          headers: await headers(),
        });

        successCount++;
      } catch (error) {
        console.error(`Failed to update role for organization ${change.organizationId}:`, error);
      }
    }

    return getActionResponse({ data: successCount });
  } catch (error) {
    return getActionResponse({ error });
  }
};