"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { Quiz } from "@prisma/client";
import { headers } from "next/headers";
import { QuizWithDetails, ResponseWithUser } from "./page.types";

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

    if (userOrgIds.length === 0) {
      return getActionResponse({
        data: { quizzes: [], totalCount: 0, totalPages: 0 },
      });
    }

    const targetOrgIds =
      organizationIds?.filter((id) => userOrgIds.includes(id)) || [];

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
  data: Pick<Quiz, "title" | "description" | "organizationId">
): Promise<ActionResponse<Quiz>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const quiz = await db.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        organizationId: data.organizationId,
        createdBy: session.user.id,
      },
    });

    return getActionResponse({ data: quiz });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const updateQuizAction = async (
  id: string,
  data: Partial<Pick<Quiz, "title" | "description">>
): Promise<ActionResponse<Quiz>> => {
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
): Promise<ActionResponse<Quiz>> => {
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
      return getActionResponse({ error: "Quiz not found" });
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
