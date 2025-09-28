"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { headers } from "next/headers";
import { DashboardMetrics } from "./page.types";

export const processInvitationAction = async (
  invitationId: string
): Promise<ActionResponse<boolean>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    await auth.api.acceptInvitation({
      body: { invitationId },
      headers: await headers(),
    });

    return getActionResponse({ data: true });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getDashboardMetricsAction = async (
  organizationIds?: string[]
): Promise<ActionResponse<DashboardMetrics>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const { db } = await getAuthenticatedClient();

    // Get all organizations the user is a member of
    const userMemberships = await db.member.findMany({
      where: { userId: session.user.id },
      select: {
        organizationId: true,
        role: true,
      }
    });

    const userOrgIds = userMemberships.map(m => m.organizationId);

    if (userOrgIds.length === 0) {
      return getActionResponse({
        data: {
          totalQuizzes: 0,
          completedToday: 0,
          teamMembers: 0,
          activeInvites: 0,
        }
      });
    }

    // Filter by user's organizations and optionally by specific organizationIds
    let targetOrgIds = userOrgIds;
    if (organizationIds && organizationIds.length > 0) {
      targetOrgIds = organizationIds.filter(id => userOrgIds.includes(id));
    }

    // Check if user has admin access to any of the target organizations
    const hasAdminAccess = userMemberships.some(
      m => targetOrgIds.includes(m.organizationId) && (m.role === "admin" || m.role === "owner")
    );
    const isSuperAdmin = session.user.role === "super-admin";

    // Calculate metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalQuizzes, completedToday, teamMembers, activeInvites] = await Promise.all([
      // Total quizzes in selected organizations
      db.quiz.count({
        where: {
          organizationId: { in: targetOrgIds },
        },
      }),

      // Quiz responses completed today
      db.response.count({
        where: {
          quiz: {
            organizationId: { in: targetOrgIds },
          },
          completedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Team members (only for admin users)
      hasAdminAccess || isSuperAdmin
        ? db.member.count({
            where: {
              organizationId: { in: targetOrgIds },
            },
          })
        : 0,

      // Active invites (only for admin users)
      hasAdminAccess || isSuperAdmin
        ? db.invitation.count({
            where: {
              organizationId: { in: targetOrgIds },
              status: "pending",
            },
          })
        : 0,
    ]);

    return getActionResponse({
      data: {
        totalQuizzes,
        completedToday,
        teamMembers,
        activeInvites,
      }
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};