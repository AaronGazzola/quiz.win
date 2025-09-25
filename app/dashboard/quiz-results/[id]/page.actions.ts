"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { headers } from "next/headers";
import { QuizResultData } from "./page.types";

export const getQuizResultAction = async (
  quizId: string
): Promise<ActionResponse<QuizResultData | null>> => {
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
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!response) {
      return getActionResponse({ error: "Quiz result not found" });
    }

    const userOrganizations = await db.member.findMany({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    const hasAccess = userOrganizations.some(
      (membership) => membership.organizationId === response.quiz.organizationId
    );

    if (!hasAccess) {
      return getActionResponse({ error: "Access denied to this quiz result" });
    }

    return getActionResponse({ data: response as QuizResultData });
  } catch (error) {
    return getActionResponse({ error });
  }
};