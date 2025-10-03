"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { withCampusPermission } from "@/lib/data-access";
import { Assessment, Question, Response } from "@prisma/client";
import { headers } from "next/headers";

export type AssessmentWithQuestions = Assessment & {
  questions: Question[];
};

export const getAssessments = async (
  campusId: string,
  filters?: {
    subject?: string;
    gradeLevel?: string;
    classroomId?: string;
  }
): Promise<ActionResponse<AssessmentWithQuestions[]>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const assessments = await withCampusPermission(
      session.user.id,
      campusId,
      "assessment",
      "read",
      async () => {
        return await db.assessment.findMany({
          where: {
            organizationId: campusId,
            ...(filters?.subject && { subject: filters.subject }),
            ...(filters?.gradeLevel && { gradeLevel: filters.gradeLevel }),
            ...(filters?.classroomId && { classroomId: filters.classroomId }),
          },
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      }
    );

    return getActionResponse({ data: assessments });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getAssessmentById = async (
  assessmentId: string
): Promise<ActionResponse<AssessmentWithQuestions | null>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    return getActionResponse({ data: assessment });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const createAssessment = async (data: {
  title: string;
  description?: string;
  organizationId: string;
  createdBy: string;
  subject?: string;
  gradeLevel?: string;
  classroomId?: string;
  assignedTo?: string[];
}): Promise<ActionResponse<Assessment>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const assessment = await withCampusPermission(
      session.user.id,
      data.organizationId,
      "assessment",
      "create",
      async () => {
        return await db.assessment.create({
          data: {
            title: data.title,
            description: data.description,
            organizationId: data.organizationId,
            createdBy: data.createdBy,
            subject: data.subject,
            gradeLevel: data.gradeLevel,
            classroomId: data.classroomId,
            assignedTo: data.assignedTo || [],
          },
        });
      }
    );

    return getActionResponse({ data: assessment });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const updateAssessment = async (
  assessmentId: string,
  data: {
    title?: string;
    description?: string;
    subject?: string;
    gradeLevel?: string;
    classroomId?: string;
    assignedTo?: string[];
    isActive?: boolean;
  }
): Promise<ActionResponse<Assessment>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const existingAssessment = await db.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!existingAssessment) {
      throw new Error("Assessment not found");
    }

    const assessment = await withCampusPermission(
      session.user.id,
      existingAssessment.organizationId,
      "assessment",
      "update",
      async () => {
        return await db.assessment.update({
          where: { id: assessmentId },
          data,
        });
      }
    );

    return getActionResponse({ data: assessment });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const assignAssessmentToClassroom = async (
  assessmentId: string,
  classroomId: string
): Promise<ActionResponse<Assessment>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const existingAssessment = await db.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!existingAssessment) {
      throw new Error("Assessment not found");
    }

    const assessment = await withCampusPermission(
      session.user.id,
      existingAssessment.organizationId,
      "assessment",
      "update",
      async () => {
        return await db.assessment.update({
          where: { id: assessmentId },
          data: { classroomId },
        });
      }
    );

    return getActionResponse({ data: assessment });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const assignAssessmentToStudents = async (
  assessmentId: string,
  studentIds: string[]
): Promise<ActionResponse<Assessment>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const existingAssessment = await db.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!existingAssessment) {
      throw new Error("Assessment not found");
    }

    const assessment = await withCampusPermission(
      session.user.id,
      existingAssessment.organizationId,
      "assessment",
      "update",
      async () => {
        return await db.assessment.update({
          where: { id: assessmentId },
          data: {
            assignedTo: {
              set: studentIds,
            },
          },
        });
      }
    );

    return getActionResponse({ data: assessment });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const gradeAssessment = async (
  responseId: string,
  score: number
): Promise<ActionResponse<Response>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const response = await db.response.update({
      where: { id: responseId },
      data: {
        score,
      },
    });

    return getActionResponse({ data: response });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getAssessmentResponses = async (
  assessmentId: string
): Promise<ActionResponse<Response[]>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const responses = await withCampusPermission(
      session.user.id,
      assessment.organizationId,
      "assessment",
      "read",
      async () => {
        return await db.response.findMany({
          where: { quizId: assessmentId },
          orderBy: { completedAt: "desc" },
        });
      }
    );

    return getActionResponse({ data: responses });
  } catch (error) {
    return getActionResponse({ error });
  }
};
