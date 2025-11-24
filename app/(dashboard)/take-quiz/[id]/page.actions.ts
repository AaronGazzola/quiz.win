"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { getUserOrganizations } from "@/lib/role.utils";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
import { Response } from "@prisma/client";
import { headers } from "next/headers";
import { QuizForTaking, SubmitResponseData, ResponseWithDetails } from "./page.types";
import { processQuizCompletionAction } from "@/app/(dashboard)/gamification/gamification.actions";
import { GamificationRewards } from "@/lib/gamification/types";

export const getQuizForTakingAction = async (
  quizId: string
): Promise<ActionResponse<QuizForTaking | null>> => {
  try {
    conditionalLog({ action: "getQuizForTakingAction", quizId }, { label: LOG_LABELS.QUIZ });

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      conditionalLog({ action: "getQuizForTakingAction", quizId, error: "Unauthorized" }, { label: LOG_LABELS.QUIZ });
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();

    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const queryParams = { id: quizId, isActive: true };
    conditionalLog({ action: "getQuizForTakingAction", queryParams }, { label: LOG_LABELS.QUIZ });

    const quiz = await db.quiz.findFirst({
      where: queryParams,
      include: {
        Question: {
          orderBy: { order: "asc" },
        },
      },
    });

    conditionalLog({ action: "getQuizForTakingAction", quizId, quizFound: !!quiz }, { label: LOG_LABELS.QUIZ });

    if (!quiz) {
      conditionalLog({ action: "getQuizForTakingAction", quizId, error: "Quiz not found or inactive" }, { label: LOG_LABELS.QUIZ });
      return getActionResponse({ error: "Quiz not found or inactive" });
    }

    const isSuperAdmin = dbUser?.role === "super-admin";

    if (!isSuperAdmin) {
      const userOrganizations = await getUserOrganizations(session.user.id);
      const hasAccess = userOrganizations.some(
        (org) => org.id === quiz.organizationId
      );

      if (!hasAccess) {
        return getActionResponse({ error: "Access denied to this quiz" });
      }
    }

    conditionalLog({ action: "getQuizForTakingAction", quizId, success: true }, { label: LOG_LABELS.QUIZ });
    return getActionResponse({ data: quiz as QuizForTaking });
  } catch (error) {
    conditionalLog({ action: "getQuizForTakingAction", quizId, error }, { label: LOG_LABELS.QUIZ });
    return getActionResponse({ error });
  }
};

export const submitResponseAction = async (
  data: SubmitResponseData
): Promise<ActionResponse<Response & { gamification?: GamificationRewards }>> => {
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

    const quiz = await db.quiz.findUnique({
      where: { id: data.quizId },
      select: { organizationId: true },
    });

    if (!quiz) {
      return getActionResponse({ error: "Quiz not found" });
    }

    const isPerfectScore = data.score === 1.0;

    const gamificationResult = await processQuizCompletionAction({
      userId: session.user.id,
      organizationId: quiz.organizationId,
      quizId: data.quizId,
      score: data.score,
      timeSpentMinutes: data.timeSpent,
      isPerfectScore,
    });

    const response = await db.response.create({
      data: {
        quizId: data.quizId,
        userId: session.user.id,
        answers: JSON.parse(JSON.stringify(data.answers)),
        score: data.score,
        completedAt: new Date(),
        pointsEarned: gamificationResult.data?.pointsEarned || 0,
        achievementsUnlocked:
          gamificationResult.data?.achievementsUnlocked.map((a) => a.key) || [],
        bonusMultiplier: 1.0,
      },
    });

    return getActionResponse({
      data: {
        ...response,
        gamification: gamificationResult.data || undefined,
      },
    });
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
        quiz: {
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