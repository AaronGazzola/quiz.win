"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { withCampusPermission } from "@/lib/data-access";
import { Teacher, User } from "@prisma/client";
import { headers } from "next/headers";

export type TeacherWithUser = Teacher & { user: User };

export const getTeachers = async (
  campusId: string
): Promise<ActionResponse<TeacherWithUser[]>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const teachers = await withCampusPermission(
      session.user.id,
      campusId,
      "teacher",
      "read",
      async () => {
        return await db.teacher.findMany({
          where: { campusId },
          include: { user: true },
          orderBy: { createdAt: "desc" },
        });
      }
    );

    return getActionResponse({ data: teachers });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getTeacherById = async (
  teacherId: string
): Promise<ActionResponse<TeacherWithUser | null>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const teacher = await db.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    return getActionResponse({ data: teacher });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const createTeacher = async (data: {
  userId: string;
  campusId: string;
  certifications?: string[];
  subjects?: string[];
  employeeId?: string;
  cvUrl?: string;
}): Promise<ActionResponse<Teacher>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const teacher = await withCampusPermission(
      session.user.id,
      data.campusId,
      "teacher",
      "create",
      async () => {
        return await db.teacher.create({
          data: {
            userId: data.userId,
            campusId: data.campusId,
            certifications: data.certifications || [],
            subjects: data.subjects || [],
            employeeId: data.employeeId,
            cvUrl: data.cvUrl,
          },
        });
      }
    );

    return getActionResponse({ data: teacher });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const updateTeacher = async (
  teacherId: string,
  data: {
    certifications?: string[];
    subjects?: string[];
    employeeId?: string;
    cvUrl?: string;
  }
): Promise<ActionResponse<Teacher>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const existingTeacher = await db.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!existingTeacher) {
      throw new Error("Teacher not found");
    }

    const teacher = await withCampusPermission(
      session.user.id,
      existingTeacher.campusId,
      "teacher",
      "update",
      async () => {
        return await db.teacher.update({
          where: { id: teacherId },
          data,
        });
      }
    );

    return getActionResponse({ data: teacher });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const assignTeacherToSubject = async (
  teacherId: string,
  subject: string
): Promise<ActionResponse<Teacher>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const existingTeacher = await db.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!existingTeacher) {
      throw new Error("Teacher not found");
    }

    const teacher = await withCampusPermission(
      session.user.id,
      existingTeacher.campusId,
      "teacher",
      "update",
      async () => {
        return await db.teacher.update({
          where: { id: teacherId },
          data: {
            subjects: {
              push: subject,
            },
          },
        });
      }
    );

    return getActionResponse({ data: teacher });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const removeTeacherFromSubject = async (
  teacherId: string,
  subject: string
): Promise<ActionResponse<Teacher>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const existingTeacher = await db.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!existingTeacher) {
      throw new Error("Teacher not found");
    }

    const teacher = await withCampusPermission(
      session.user.id,
      existingTeacher.campusId,
      "teacher",
      "update",
      async () => {
        return await db.teacher.update({
          where: { id: teacherId },
          data: {
            subjects: {
              set: existingTeacher.subjects.filter((s) => s !== subject),
            },
          },
        });
      }
    );

    return getActionResponse({ data: teacher });
  } catch (error) {
    return getActionResponse({ error });
  }
};
