"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { getUserOrganizations, canManageResponses, isSuperAdmin } from "@/lib/role.utils";
import { headers } from "next/headers";
import { QuizResultData } from "./page.types";

export const getQuizResultAction = async (
  quizId: string,
  targetUserId?: string
): Promise<ActionResponse<QuizResultData | null>> => {
  try {

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();
    const currentUserId = session.user.id;
    const userIdToQuery = targetUserId || currentUserId;
    const isViewingOtherUser = targetUserId && targetUserId !== currentUserId;


    const response = await db.response.findFirst({
      where: {
        quizId,
        userId: userIdToQuery,
      },
      include: {
        assessment: {
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

    if (isViewingOtherUser) {
      const isSuperAdminUser = await isSuperAdmin();
      const canManageResponsesForOrg = await canManageResponses(currentUserId, response.assessment.organizationId);


      if (!isSuperAdminUser && !canManageResponsesForOrg) {
        return getActionResponse({ error: "Access denied: insufficient permissions to view other users' responses" });
      }
    }

    const isSuperAdminUser = await isSuperAdmin();

    if (!isSuperAdminUser) {
      const userOrganizations = await getUserOrganizations(currentUserId);
      const hasAccess = userOrganizations.some(
        (org) => org.id === response.assessment.organizationId
      );

      if (!hasAccess) {
        return getActionResponse({ error: "Access denied to this quiz result" });
      }
    }

    return getActionResponse({ data: response as QuizResultData });
  } catch (error) {
    return getActionResponse({ error });
  }
};