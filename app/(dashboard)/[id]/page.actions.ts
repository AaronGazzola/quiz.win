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
    console.log(JSON.stringify({action:"getQuizResultAction",quizId,targetUserId}));

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.log(JSON.stringify({action:"getQuizResultAction",error:"unauthorized"}));
      return getActionResponse({ error: "Unauthorized" });
    }

    const { db } = await getAuthenticatedClient();
    const currentUserId = session.user.id;
    const userIdToQuery = targetUserId || currentUserId;
    const isViewingOtherUser = targetUserId && targetUserId !== currentUserId;

    console.log(JSON.stringify({action:"getQuizResultAction",currentUserId,userIdToQuery,isViewingOtherUser}));

    const response = await db.response.findFirst({
      where: {
        quizId,
        userId: userIdToQuery,
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

    console.log(JSON.stringify({action:"getQuizResultAction",responseFound:!!response,quizOrganizationId:response?.quiz?.organizationId}));

    if (!response) {
      return getActionResponse({ error: "Quiz result not found" });
    }

    if (isViewingOtherUser) {
      const isSuperAdminUser = await isSuperAdmin();
      const canManageResponsesForOrg = await canManageResponses(currentUserId, response.quiz.organizationId);

      console.log(JSON.stringify({action:"getQuizResultAction",permissionCheck:{isSuperAdminUser,canManageResponsesForOrg}}));

      if (!isSuperAdminUser && !canManageResponsesForOrg) {
        return getActionResponse({ error: "Access denied: insufficient permissions to view other users' responses" });
      }
    }

    const userOrganizations = await getUserOrganizations(currentUserId);
    const hasAccess = userOrganizations.some(
      (org) => org.id === response.quiz.organizationId
    );

    console.log(JSON.stringify({action:"getQuizResultAction",hasOrgAccess:hasAccess}));

    if (!hasAccess) {
      return getActionResponse({ error: "Access denied to this quiz result" });
    }

    console.log(JSON.stringify({action:"getQuizResultAction",success:true}));
    return getActionResponse({ data: response as QuizResultData });
  } catch (error) {
    console.log(JSON.stringify({action:"getQuizResultAction",error:error.message}));
    return getActionResponse({ error });
  }
};