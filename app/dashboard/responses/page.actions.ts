"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { headers } from "next/headers";
import { GetResponsesParams, ResponseWithDetails } from "./page.types";

export const getResponsesAction = async (
  params: GetResponsesParams = {}
): Promise<
  ActionResponse<{
    responses: ResponseWithDetails[];
    totalCount: number;
    totalPages: number;
    quizOptions: { id: string; title: string }[];
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
      organizationId,
      search = "",
      sortColumn = "completedAt",
      sortDirection = "desc",
      page = 0,
      itemsPerPage = 10,
      quizFilter = "",
    } = params;

    if (!organizationId) {
      return getActionResponse({ error: "Organization ID is required" });
    }

    const userOrganizations = await db.member.findMany({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    const hasAccess = userOrganizations.some(
      (membership) => membership.organizationId === organizationId
    );

    if (!hasAccess) {
      return getActionResponse({ error: "Access denied to this organization" });
    }

    const baseWhere = {
      quiz: { organizationId },
      ...(quizFilter && { quizId: quizFilter }),
      ...(search && {
        OR: [
          {
            quiz: {
              title: { contains: search, mode: "insensitive" as const },
            },
          },
          {
            user: {
              email: { contains: search, mode: "insensitive" as const },
            },
          },
          {
            user: {
              name: { contains: search, mode: "insensitive" as const },
            },
          },
        ],
      }),
    };

    let orderBy: Record<string, string> | Record<string, Record<string, string>> = { completedAt: "desc" };
    if (sortColumn && sortDirection) {
      switch (sortColumn) {
        case "user":
          orderBy = {
            user: {
              email: sortDirection,
            },
          };
          break;
        case "quiz":
          orderBy = {
            quiz: {
              title: sortDirection,
            },
          };
          break;
        case "score":
          orderBy = { score: sortDirection };
          break;
        case "completedAt":
          orderBy = { completedAt: sortDirection };
          break;
        default:
          orderBy = { completedAt: "desc" };
      }
    }

    const [responses, totalCount, quizOptions] = await Promise.all([
      db.response.findMany({
        where: baseWhere,
        orderBy,
        skip: page * itemsPerPage,
        take: itemsPerPage,
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
      }),
      db.response.count({ where: baseWhere }),
      db.quiz.findMany({
        where: { organizationId },
        select: {
          id: true,
          title: true,
        },
        orderBy: { title: "asc" },
      }),
    ]);

    // Manually join user data since Response doesn't have a direct relation to User
    const userIds = [...new Set(responses.map(r => r.userId))];
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = users.reduce((map, user) => {
      map[user.id] = user;
      return map;
    }, {} as Record<string, { id: string; name: string | null; email: string }>);

    const responsesWithUsers = responses.map(response => ({
      ...response,
      user: userMap[response.userId] || null,
    }));

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return getActionResponse({
      data: {
        responses: responsesWithUsers as ResponseWithDetails[],
        totalCount,
        totalPages,
        quizOptions,
      },
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const exportResponsesAction = async (
  responseIds: string[]
): Promise<ActionResponse<{ exportData: Record<string, unknown>[] }>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const responses = await db.response.findMany({
      where: { id: { in: responseIds } },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            organizationId: true,
          },
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    // Manually join user data
    const userIds = [...new Set(responses.map(r => r.userId))];
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = users.reduce((map, user) => {
      map[user.id] = user;
      return map;
    }, {} as Record<string, { id: string; name: string | null; email: string }>);

    const responsesWithUsers = responses.map(response => ({
      ...response,
      user: userMap[response.userId] || null,
    }));

    const userOrganizations = await db.member.findMany({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    const accessibleOrgIds = userOrganizations.map((membership) => membership.organizationId);

    const filteredResponses = responsesWithUsers.filter((response) =>
      accessibleOrgIds.includes(response.quiz.organizationId)
    );

    const exportData = filteredResponses.map((response) => ({
      responseId: response.id,
      userId: response.userId,
      userName: response.user?.name || "",
      userEmail: response.user?.email || "",
      quizTitle: response.quiz.title,
      score: response.score ? Math.round(response.score * 100) : null,
      scorePercentage: response.score ? `${Math.round(response.score * 100)}%` : "Not scored",
      completedAt: response.completedAt.toISOString(),
      answers: response.answers as Record<string, unknown>,
      totalQuestions: response.quiz.questions.length,
    }));

    return getActionResponse({ data: { exportData } });
  } catch (error) {
    return getActionResponse({ error });
  }
};