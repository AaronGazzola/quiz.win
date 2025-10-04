"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { headers } from "next/headers";

interface MemberWithUser {
  id: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export const getOrganizationMembersAction = async (
  organizationId: string
): Promise<ActionResponse<MemberWithUser[]>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const userMembership = await db.member.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId,
        },
      },
    });

    const isAdmin = userMembership?.role === "admin" || userMembership?.role === "owner";
    const isSuperAdmin = session.user.role === "super-admin";

    if (!isAdmin && !isSuperAdmin) {
      return getActionResponse({ error: "Access denied" });
    }

    const members = await db.member.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return getActionResponse({ data: members as MemberWithUser[] });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const updateMemberRoleAction = async (
  memberId: string,
  role: string
): Promise<ActionResponse<MemberWithUser>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const member = await db.member.findUnique({
      where: { id: memberId },
      include: { organization: true },
    });

    if (!member) {
      return getActionResponse({ error: "Member not found" });
    }

    const userMembership = await db.member.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: member.organizationId,
        },
      },
    });

    const isAdmin = userMembership?.role === "admin" || userMembership?.role === "owner";
    const isSuperAdmin = session.user.role === "super-admin";

    if (!isAdmin && !isSuperAdmin) {
      return getActionResponse({ error: "Access denied" });
    }

    const updatedMember = await db.member.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return getActionResponse({ data: updatedMember as MemberWithUser });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const removeMemberAction = async (
  memberId: string
): Promise<ActionResponse<{ success: boolean }>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const member = await db.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return getActionResponse({ error: "Member not found" });
    }

    const userMembership = await db.member.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: member.organizationId,
        },
      },
    });

    const isAdmin = userMembership?.role === "admin" || userMembership?.role === "owner";
    const isSuperAdmin = session.user.role === "super-admin";

    if (!isAdmin && !isSuperAdmin) {
      return getActionResponse({ error: "Access denied" });
    }

    if (member.userId === session.user.id) {
      return getActionResponse({ error: "Cannot remove yourself" });
    }

    await db.member.delete({
      where: { id: memberId },
    });

    return getActionResponse({ data: { success: true } });
  } catch (error) {
    return getActionResponse({ error });
  }
};