"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { getUserOrganizations } from "@/lib/role.utils";
import { Response } from "@prisma/client";
import { headers } from "next/headers";
import { QuizForTaking, SubmitResponseData, ResponseWithDetails } from "./page.types";

export const getQuizForTakingAction = async (
  quizId: string
): Promise<ActionResponse<QuizForTaking | null>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const quiz = await db.assessment.findFirst({
      where: {
        id: quizId,
        isActive: true,
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!quiz) {
      return getActionResponse({ error: "Quiz not found or inactive" });
    }

    const isSuperAdmin = session.user.role === "super-admin";

    if (!isSuperAdmin) {
      const userOrganizations = await getUserOrganizations(session.user.id);
      const hasAccess = userOrganizations.some(
        (org) => org.id === quiz.organizationId
      );

      if (!hasAccess) {
        return getActionResponse({ error: "Access denied to this quiz" });
      }
    }

    return getActionResponse({ data: quiz as QuizForTaking });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const submitResponseAction = async (
  data: SubmitResponseData
): Promise<ActionResponse<Response>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const existingResponse = await db.response.findFirst({
      where: {
        quizId: data.quizId,
        userId: session.user.id,
      },
    });

    if (existingResponse) {
      return getActionResponse({ error: "Quiz already completed" });
    }

    const response = await db.response.create({
      data: {
        quizId: data.quizId,
        userId: session.user.id,
        answers: JSON.parse(JSON.stringify(data.answers)),
        score: data.score,
        completedAt: new Date(),
      },
    });

    return getActionResponse({ data: response });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getExistingResponseAction = async (
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

    const response = await db.response.findFirst({
      where: {
        quizId,
        userId: session.user.id,
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    return getActionResponse({ data: response as ResponseWithDetails });
  } catch (error) {
    return getActionResponse({ error });
  }
};