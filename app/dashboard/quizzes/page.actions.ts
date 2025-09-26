"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { Quiz } from "@prisma/client";
import { headers } from "next/headers";
import { QuizWithDetails } from "./page.types";

export interface GetQuizzesParams {
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
      select: { organizationId: true }
    });

    const userOrgIds = userMemberships.map(m => m.organizationId);

    if (userOrgIds.length === 0) {
      return getActionResponse({
        data: { quizzes: [], totalCount: 0, totalPages: 0 }
      });
    }

    // Filter by user's organizations and optionally by specific organizationIds
    let targetOrgIds = userOrgIds;
    if (organizationIds && organizationIds.length > 0) {
      targetOrgIds = organizationIds.filter(id => userOrgIds.includes(id));
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

    const orderBy = sortColumn ? { [sortColumn]: sortDirection } : { createdAt: "desc" as const };

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

export const deleteQuizAction = async (id: string): Promise<ActionResponse<Quiz>> => {
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

export const getUserOrganizationsAction = async (): Promise<
  ActionResponse<{ id: string; name: string; slug: string; role: string }[]>
> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const memberships = await db.member.findMany({
      where: { userId: session.user.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const organizations = memberships.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role,
    }));

    return getActionResponse({ data: organizations });
  } catch (error) {
    return getActionResponse({ error });
  }
};