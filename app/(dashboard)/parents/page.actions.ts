"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { withCampusPermission } from "@/lib/data-access";
import { Parent, User, Student, Prisma } from "@prisma/client";
import { headers } from "next/headers";

export type ParentWithUser = Parent & {
  user: User;
  students: Array<{
    student: Student & { user: User };
  }>;
};

export const getParents = async (
  campusId: string
): Promise<ActionResponse<ParentWithUser[]>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const parents = await withCampusPermission(
      session.user.id,
      campusId,
      "parent",
      "read",
      async () => {
        return await db.parent.findMany({
          where: {
            students: {
              some: {
                student: {
                  campusId,
                },
              },
            },
          },
          include: {
            user: true,
            students: {
              include: {
                student: {
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

    return getActionResponse({ data: parents });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getParentById = async (
  parentId: string
): Promise<ActionResponse<ParentWithUser | null>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const parent = await db.parent.findUnique({
      where: { id: parentId },
      include: {
        user: true,
        students: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return getActionResponse({ data: parent });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const createParent = async (data: {
  userId: string;
  primaryContact?: boolean;
  relationship: string;
  occupation?: string;
}): Promise<ActionResponse<Parent>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const parent = await db.parent.create({
      data: {
        userId: data.userId,
        primaryContact: data.primaryContact || false,
        relationship: data.relationship,
        occupation: data.occupation,
      },
    });

    return getActionResponse({ data: parent });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const updateParent = async (
  parentId: string,
  data: {
    primaryContact?: boolean;
    relationship?: string;
    occupation?: string;
  }
): Promise<ActionResponse<Parent>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const parent = await db.parent.update({
      where: { id: parentId },
      data,
    });

    return getActionResponse({ data: parent });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getParentStudents = async (
  parentId: string
): Promise<ActionResponse<Array<Student & { user: User }>>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const parent = await db.parent.findUnique({
      where: { id: parentId },
      include: {
        students: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new Error("Parent not found");
    }

    const students = parent.students.map((sp) => sp.student);

    return getActionResponse({ data: students });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const updateParentContact = async (
  parentId: string,
  contactData: {
    phone?: string;
    email?: string;
    emergencyContact?: Prisma.InputJsonValue;
  }
): Promise<ActionResponse<User>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const parent = await db.parent.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new Error("Parent not found");
    }

    const user = await db.user.update({
      where: { id: parent.userId },
      data: {
        phone: contactData.phone,
        email: contactData.email,
        emergencyContact: contactData.emergencyContact,
      },
    });

    return getActionResponse({ data: user });
  } catch (error) {
    return getActionResponse({ error });
  }
};
