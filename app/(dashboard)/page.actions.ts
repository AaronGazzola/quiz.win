"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { quiz } from "@prisma/client";
import { DashboardMetrics, QuizWithDetails, ResponseWithUser, ResponseWithDetails } from "./page.types";

export interface GetQuizzesParams {
  search?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  page?: number;
  itemsPerPage?: number;
  selectedOrganizationIds?: string[];
}

export interface GetQuizResponsesParams {
  quizId: string;
  search?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  page?: number;
  itemsPerPage?: number;
}


export const processInvitationAction = async (
  invitationId: string
): Promise<ActionResponse<boolean>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return getActionResponse({ error: "Invitation not found" });
    }

    if (invitation.email !== user.email) {
      return getActionResponse({ error: "Access denied" });
    }

    if (invitation.status !== "pending") {
      return getActionResponse({ error: "Invitation already processed" });
    }

    if (invitation.expiresAt < new Date()) {
      return getActionResponse({ error: "Invitation expired" });
    }

    await db.member.create({
      data: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    });

    await db.invitation.update({
      where: { id: invitationId },
      data: { status: "accepted" },
    });

    return getActionResponse({ data: true });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getDashboardMetricsAction = async (
  selectedOrganizationIds?: string[]
): Promise<ActionResponse<DashboardMetrics>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    const [dbUser, userMemberships] = await Promise.all([
      db.user.findUnique({
        where: { id: user.id },
        select: { role: true }
      }),
      db.member.findMany({
        where: { userId: user.id },
        select: {
          organizationId: true,
          role: true,
        }
      })
    ]);

    const isSuperAdmin = dbUser?.role === "super-admin";
    const allMemberOrgIds = userMemberships.map(m => m.organizationId);

    let targetOrgIds: string[];

    if (selectedOrganizationIds && selectedOrganizationIds.length > 0) {
      if (isSuperAdmin) {
        targetOrgIds = selectedOrganizationIds;
      } else {
        targetOrgIds = selectedOrganizationIds.filter(id => allMemberOrgIds.includes(id));
      }
    } else {
      if (isSuperAdmin) {
        const allOrgs = await db.organization.findMany({
          select: { id: true },
        });
        targetOrgIds = allOrgs.map(org => org.id);
      } else {
        targetOrgIds = allMemberOrgIds;
      }
    }

    if (targetOrgIds.length === 0) {
      return getActionResponse({
        data: {
          totalQuizzes: 0,
          completedToday: 0,
          teamMembers: 0,
          activeInvites: 0,
          hasAdminAccess: false,
        }
      });
    }

    const hasAdminAccess = isSuperAdmin || userMemberships.some(
      m => targetOrgIds!.includes(m.organizationId) && (m.role === "admin" || m.role === "owner")
    );

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

      // quiz responses completed today
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
      hasAdminAccess
        ? db.member.count({
            where: {
              organizationId: { in: targetOrgIds },
            },
          })
        : 0,

      // Active invites (only for admin users)
      hasAdminAccess
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
        hasAdminAccess,
      }
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getQuizzesAction = async (
  params: GetQuizzesParams = {}
): Promise<
  ActionResponse<{
    quizzes: QuizWithDetails[];
    totalCount: number;
    totalPages: number;
  }>
> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const {
      search = "",
      sortColumn = "createdAt",
      sortDirection = "desc",
      page = 0,
      itemsPerPage = 10,
      selectedOrganizationIds,
    } = params;

    const [dbUser, userMemberships] = await Promise.all([
      db.user.findUnique({
        where: { id: user.id },
        select: { role: true }
      }),
      db.member.findMany({
        where: { userId: user.id },
        select: { organizationId: true, role: true }
      })
    ]);

    const isSuperAdmin = dbUser?.role === "super-admin";
    const allMemberOrgIds = userMemberships.map(m => m.organizationId);

    let targetOrgIds: string[];

    if (selectedOrganizationIds && selectedOrganizationIds.length > 0) {
      if (isSuperAdmin) {
        targetOrgIds = selectedOrganizationIds;
      } else {
        targetOrgIds = selectedOrganizationIds.filter(id => allMemberOrgIds.includes(id));
      }
    } else {
      if (isSuperAdmin) {
        const allOrgs = await db.organization.findMany({
          select: { id: true },
        });
        targetOrgIds = allOrgs.map(org => org.id);
      } else {
        targetOrgIds = allMemberOrgIds;
      }
    }

    if (targetOrgIds.length === 0) {
      return getActionResponse({
        data: { quizzes: [], totalCount: 0, totalPages: 0 },
      });
    }

    const where = {
      organizationId: { in: targetOrgIds },
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const orderBy = sortColumn
      ? { [sortColumn]: sortDirection }
      : { createdAt: "desc" as const };

    const [quizzes, totalCount] = await Promise.all([
      db.quiz.findMany({
        where,
        orderBy,
        skip: page * itemsPerPage,
        take: itemsPerPage,
        include: {
          Question: true,
          Response: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              Question: true,
              Response: true,
            },
          },
        },
      }),
      db.quiz.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return getActionResponse({
      data: {
        quizzes: quizzes as QuizWithDetails[],
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const createQuizAction = async (
  data: Pick<quiz, "title" | "description" | "organizationId">
): Promise<ActionResponse<quiz>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { nanoid } = await import("nanoid");
    const quiz = await db.quiz.create({
      data: {
        id: nanoid(),
        title: data.title,
        description: data.description,
        organizationId: data.organizationId,
        createdBy: user.id,
        updatedAt: new Date(),
      },
    });

    return getActionResponse({ data: quiz });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const updateQuizAction = async (
  id: string,
  data: Partial<Pick<quiz, "title" | "description">>
): Promise<ActionResponse<quiz>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const quiz = await db.quiz.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
      },
    });

    return getActionResponse({ data: quiz });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const deleteQuizAction = async (
  id: string
): Promise<ActionResponse<quiz>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    await db.question.deleteMany({
      where: { quizId: id },
    });

    await db.response.deleteMany({
      where: { quizId: id },
    });

    const quiz = await db.quiz.delete({
      where: { id },
    });

    return getActionResponse({ data: quiz });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const bulkDeleteQuizzesAction = async (
  ids: string[]
): Promise<ActionResponse<{ count: number }>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    await db.question.deleteMany({
      where: { quizId: { in: ids } },
    });

    await db.response.deleteMany({
      where: { quizId: { in: ids } },
    });

    const result = await db.quiz.deleteMany({
      where: { id: { in: ids } },
    });

    return getActionResponse({ data: { count: result.count } });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getQuizResponsesAction = async (
  params: GetQuizResponsesParams
): Promise<
  ActionResponse<{
    responses: ResponseWithUser[];
    totalCount: number;
    totalPages: number;
  }>
> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const {
      quizId,
      search = "",
      sortColumn = "completedAt",
      sortDirection = "desc",
      page = 0,
      itemsPerPage = 10,
    } = params;

    const [quiz, dbUser, userMembership] = await Promise.all([
      db.quiz.findUnique({
        where: { id: quizId },
        select: { organizationId: true },
      }),
      db.user.findUnique({
        where: { id: user.id },
        select: { role: true }
      }),
      db.member.findFirst({
        where: {
          userId: user.id,
          role: { in: ["admin", "owner"] },
        },
      })
    ]);

    if (!quiz) {
      return getActionResponse({ error: "quiz not found" });
    }

    const isSuperAdmin = dbUser?.role === "super-admin";
    const isAdminOfQuizOrg = userMembership?.organizationId === quiz.organizationId;

    if (!isAdminOfQuizOrg && !isSuperAdmin) {
      return getActionResponse({
        error: "Insufficient permissions to view responses",
      });
    }

    // Build search conditions
    const searchConditions = search
      ? {
          OR: [
            {
              user: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
            {
              user: {
                email: { contains: search, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {};

    const where = {
      quizId,
      ...searchConditions,
    };

    // Build order by clause
    let orderBy: Record<string, string> | { user: { [key: string]: string } } =
      { completedAt: "desc" };
    if (sortColumn === "score") {
      orderBy = { score: sortDirection };
    } else if (sortColumn === "completedAt") {
      orderBy = { completedAt: sortDirection };
    } else if (sortColumn === "userName") {
      orderBy = { user: { name: sortDirection } };
    } else if (sortColumn === "userEmail") {
      orderBy = { user: { email: sortDirection } };
    }

    const [responses, totalCount] = await Promise.all([
      db.response.findMany({
        where,
        orderBy,
        skip: page * itemsPerPage,
        take: itemsPerPage,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.response.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return getActionResponse({
      data: {
        responses: responses as ResponseWithUser[],
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getResponseDetailAction = async (
  responseId: string
): Promise<ActionResponse<ResponseWithDetails>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const [dbUser, response] = await Promise.all([
      db.user.findUnique({
        where: { id: user.id },
        select: { role: true }
      }),
      db.response.findUnique({
        where: { id: responseId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          quiz: {
            select: {
              id: true,
              title: true,
              organizationId: true,
              Question: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      })
    ]);

    if (!response) {
      return getActionResponse({ error: "Response not found" });
    }

    const userMembership = await db.member.findFirst({
      where: {
        userId: user.id,
        organizationId: response.quiz.organizationId,
        role: { in: ["admin", "owner"] },
      },
    });

    const isSuperAdmin = dbUser?.role === "super-admin";
    const isOwnResponse = response.userId === user.id;

    if (!userMembership && !isSuperAdmin && !isOwnResponse) {
      return getActionResponse({
        error: "Insufficient permissions to view this response",
      });
    }

    return getActionResponse({
      data: response as ResponseWithDetails,
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getUserResponseAction = async (
  quizId: string
): Promise<ActionResponse<ResponseWithDetails | null>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const [dbUser, quiz, userMembership] = await Promise.all([
      db.user.findUnique({
        where: { id: user.id },
        select: { role: true }
      }),
      db.quiz.findUnique({
        where: { id: quizId },
        select: { organizationId: true },
      }),
      db.member.findFirst({
        where: {
          userId: user.id,
        },
      })
    ]);

    if (!quiz) {
      return getActionResponse({ error: "quiz not found" });
    }

    const isSuperAdmin = dbUser?.role === "super-admin";
    const isMemberOfQuizOrg = userMembership?.organizationId === quiz.organizationId;

    if (!isMemberOfQuizOrg && !isSuperAdmin) {
      return getActionResponse({
        error: "You are not a member of this organization",
      });
    }

    const response = await db.response.findFirst({
      where: {
        quizId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
            Question: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    return getActionResponse({
      data: response as ResponseWithDetails | null,
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};