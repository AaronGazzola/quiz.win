"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { quiz } from "@prisma/client";
import { headers } from "next/headers";
import { DashboardMetrics, QuizWithDetails, ResponseWithUser, ResponseWithDetails } from "./page.types";

export interface GetQuizzesParams {
  organizationIds?: string[];
  search?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  page?: number;
  itemsPerPage?: number;
}

export interface GetQuizResponsesParams {
  quizId: string;
  organizationIds?: string[];
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
    const isSuperAdmin = session.user.role === "super-admin";

    if (!isSuperAdmin && userOrgIds.length === 0) {
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
      targetOrgIds = isSuperAdmin
        ? organizationIds
        : organizationIds.filter(id => userOrgIds.includes(id));
    }

    // Check if user has admin access to any of the target organizations
    const hasAdminAccess = isSuperAdmin || userMemberships.some(
      m => targetOrgIds.includes(m.organizationId) && (m.role === "admin" || m.role === "owner")
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const {
      organizationIds,
      search = "",
      sortColumn = "createdAt",
      sortDirection = "desc",
      page = 0,
      itemsPerPage = 10,
    } = params;

    // Get all organizations the user is a member of
    const userMemberships = await db.member.findMany({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    const userOrgIds = userMemberships.map((m) => m.organizationId);
    const isSuperAdmin = session.user.role === "super-admin";

    if (!isSuperAdmin && userOrgIds.length === 0) {
      return getActionResponse({
        data: { quizzes: [], totalCount: 0, totalPages: 0 },
      });
    }

    const targetOrgIds = isSuperAdmin
      ? organizationIds || []
      : organizationIds?.filter((id) => userOrgIds.includes(id)) || [];

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
          questions: true,
          responses: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              questions: true,
              responses: true,
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const { nanoid } = await import("nanoid");
    const quiz = await db.quiz.create({
      data: {
        id: nanoid(),
        title: data.title,
        description: data.description,
        organizationId: data.organizationId,
        createdBy: session.user.id,
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const {
      quizId,
      organizationIds,
      search = "",
      sortColumn = "completedAt",
      sortDirection = "desc",
      page = 0,
      itemsPerPage = 10,
    } = params;

    // First, verify the quiz exists and get its organization
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      select: { organizationId: true },
    });

    if (!quiz) {
      return getActionResponse({ error: "quiz not found" });
    }

    // If organizationIds are provided, verify the quiz belongs to one of them
    if (
      organizationIds &&
      organizationIds.length > 0 &&
      !organizationIds.includes(quiz.organizationId)
    ) {
      return getActionResponse({
        data: { responses: [], totalCount: 0, totalPages: 0 },
      });
    }

    // Check if user is admin of the quiz's organization
    const userMembership = await db.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: quiz.organizationId,
        role: { in: ["admin", "owner"] },
      },
    });

    const isSuperAdmin = session.user.role === "super-admin";

    if (!userMembership && !isSuperAdmin) {
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const response = await db.response.findUnique({
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
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!response) {
      return getActionResponse({ error: "Response not found" });
    }

    const userMembership = await db.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: response.quiz.organizationId,
        role: { in: ["admin", "owner"] },
      },
    });

    const isSuperAdmin = session.user.role === "super-admin";
    const isOwnResponse = response.userId === session.user.id;

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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      select: { organizationId: true },
    });

    if (!quiz) {
      return getActionResponse({ error: "quiz not found" });
    }

    const userMembership = await db.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: quiz.organizationId,
      },
    });

    const isSuperAdmin = session.user.role === "super-admin";

    if (!userMembership && !isSuperAdmin) {
      return getActionResponse({
        error: "You are not a member of this organization",
      });
    }

    const response = await db.response.findFirst({
      where: {
        quizId,
        userId: session.user.id,
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
            questions: {
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