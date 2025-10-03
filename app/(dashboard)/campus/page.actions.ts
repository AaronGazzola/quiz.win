"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { withCampusPermission } from "@/lib/data-access";
import { Campus, Prisma } from "@prisma/client";
import { headers } from "next/headers";

export const getCampuses = async (): Promise<ActionResponse<Campus[]>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (session.user.role !== "super-admin") {
      throw new Error("Only super-admins can list all campuses");
    }

    const { db } = await getAuthenticatedClient();

    const campuses = await db.campus.findMany({
      orderBy: { createdAt: "desc" },
    });

    return getActionResponse({ data: campuses });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getCampusById = async (
  campusId: string
): Promise<ActionResponse<Campus | null>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const campus = await db.campus.findUnique({
      where: { id: campusId },
    });

    return getActionResponse({ data: campus });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const createCampus = async (data: {
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  principalName?: string;
  capacity?: number;
  location?: string;
  logo?: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<ActionResponse<Campus>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (session.user.role !== "super-admin") {
      throw new Error("Only super-admins can create campuses");
    }

    const { db } = await getAuthenticatedClient();

    const campus = await db.campus.create({
      data,
    });

    return getActionResponse({ data: campus });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const updateCampus = async (
  campusId: string,
  data: {
    name?: string;
    slug?: string;
    address?: string;
    phone?: string;
    principalName?: string;
    capacity?: number;
    location?: string;
    logo?: string;
    metadata?: Prisma.InputJsonValue;
  }
): Promise<ActionResponse<Campus>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const campus = await withCampusPermission(
      session.user.id,
      campusId,
      "teacher",
      "update",
      async () => {
        return await db.campus.update({
          where: { id: campusId },
          data,
        });
      }
    );

    return getActionResponse({ data: campus });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getCampusStats = async (
  campusId: string
): Promise<ActionResponse<{
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClassrooms: number;
  totalAssessments: number;
}>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const [totalStudents, totalTeachers, totalParents, totalClassrooms, totalAssessments] =
      await Promise.all([
        db.student.count({ where: { campusId } }),
        db.teacher.count({ where: { campusId } }),
        db.parent.count({
          where: {
            students: {
              some: {
                student: {
                  campusId,
                },
              },
            },
          },
        }),
        db.classroom.count({ where: { campusId } }),
        db.assessment.count({ where: { organizationId: campusId } }),
      ]);

    return getActionResponse({
      data: {
        totalStudents,
        totalTeachers,
        totalParents,
        totalClassrooms,
        totalAssessments,
      },
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};
