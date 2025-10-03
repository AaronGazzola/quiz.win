"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { withCampusPermission } from "@/lib/data-access";
import { Student, User, Parent, Prisma } from "@prisma/client";
import { headers } from "next/headers";

export type StudentWithUser = Student & {
  user: User;
  parents: Array<{
    parent: Parent & { user: User };
  }>;
};

export const getStudents = async (
  campusId: string,
  filters?: {
    grade?: string;
    search?: string;
  }
): Promise<ActionResponse<StudentWithUser[]>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const students = await withCampusPermission(
      session.user.id,
      campusId,
      "student",
      "read",
      async () => {
        return await db.student.findMany({
          where: {
            campusId,
            ...(filters?.grade && { grade: filters.grade }),
            ...(filters?.search && {
              user: {
                OR: [
                  { name: { contains: filters.search, mode: "insensitive" } },
                  { email: { contains: filters.search, mode: "insensitive" } },
                ],
              },
            }),
          },
          include: {
            user: true,
            parents: {
              include: {
                parent: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      }
    );

    return getActionResponse({ data: students });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getStudentById = async (
  studentId: string
): Promise<ActionResponse<StudentWithUser | null>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        parents: {
          include: {
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return getActionResponse({ data: student });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const createStudent = async (data: {
  userId: string;
  campusId: string;
  grade: string;
  authorizedPickups?: Prisma.InputJsonValue;
  medicalInfo?: Prisma.InputJsonValue;
  photoUrl?: string;
}): Promise<ActionResponse<Student>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const student = await withCampusPermission(
      session.user.id,
      data.campusId,
      "student",
      "create",
      async () => {
        return await db.student.create({
          data: {
            userId: data.userId,
            campusId: data.campusId,
            grade: data.grade,
            authorizedPickups: data.authorizedPickups,
            medicalInfo: data.medicalInfo,
            photoUrl: data.photoUrl,
          },
        });
      }
    );

    return getActionResponse({ data: student });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const updateStudent = async (
  studentId: string,
  data: {
    grade?: string;
    authorizedPickups?: Prisma.InputJsonValue;
    medicalInfo?: Prisma.InputJsonValue;
    photoUrl?: string;
  }
): Promise<ActionResponse<Student>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const existingStudent = await db.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      throw new Error("Student not found");
    }

    const student = await withCampusPermission(
      session.user.id,
      existingStudent.campusId,
      "student",
      "update",
      async () => {
        return await db.student.update({
          where: { id: studentId },
          data,
        });
      }
    );

    return getActionResponse({ data: student });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const assignParentToStudent = async (
  studentId: string,
  parentId: string
): Promise<ActionResponse<{ success: boolean }>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const student = await db.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    await withCampusPermission(
      session.user.id,
      student.campusId,
      "student",
      "update",
      async () => {
        return await db.studentParent.create({
          data: {
            studentId,
            parentId,
          },
        });
      }
    );

    return getActionResponse({ data: { success: true } });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const removeParentFromStudent = async (
  studentId: string,
  parentId: string
): Promise<ActionResponse<{ success: boolean }>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const student = await db.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    await withCampusPermission(
      session.user.id,
      student.campusId,
      "student",
      "update",
      async () => {
        return await db.studentParent.deleteMany({
          where: {
            studentId,
            parentId,
          },
        });
      }
    );

    return getActionResponse({ data: { success: true } });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getStudentsByParent = async (
  parentId: string
): Promise<ActionResponse<StudentWithUser[]>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const students = await db.student.findMany({
      where: {
        parents: {
          some: {
            parentId,
          },
        },
      },
      include: {
        user: true,
        parents: {
          include: {
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return getActionResponse({ data: students });
  } catch (error) {
    return getActionResponse({ error });
  }
};
