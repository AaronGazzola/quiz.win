"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { withCampusPermission } from "@/lib/data-access";
import { Classroom, Teacher, User, Student, Prisma } from "@prisma/client";
import { headers } from "next/headers";

export type ClassroomWithDetails = Classroom & {
  teacher: Teacher & { user: User };
  students: Array<{
    student: Student & { user: User };
  }>;
};

export const getClassrooms = async (
  campusId: string,
  filters?: {
    grade?: string;
    subject?: string;
  }
): Promise<ActionResponse<ClassroomWithDetails[]>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const classrooms = await withCampusPermission(
      session.user.id,
      campusId,
      "classroom",
      "read",
      async () => {
        return await db.classroom.findMany({
          where: {
            campusId,
            ...(filters?.grade && { grade: filters.grade }),
            ...(filters?.subject && { subject: filters.subject }),
          },
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
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

    return getActionResponse({ data: classrooms });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getClassroomById = async (
  classroomId: string
): Promise<ActionResponse<ClassroomWithDetails | null>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const classroom = await db.classroom.findUnique({
      where: { id: classroomId },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
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

    return getActionResponse({ data: classroom });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const createClassroom = async (data: {
  name: string;
  grade: string;
  subject: string;
  campusId: string;
  teacherId: string;
  capacity?: number;
  room?: string;
  schedule?: Prisma.InputJsonValue;
}): Promise<ActionResponse<Classroom>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const classroom = await withCampusPermission(
      session.user.id,
      data.campusId,
      "classroom",
      "create",
      async () => {
        return await db.classroom.create({
          data: {
            name: data.name,
            grade: data.grade,
            subject: data.subject,
            campusId: data.campusId,
            teacherId: data.teacherId,
            capacity: data.capacity,
            room: data.room,
            schedule: data.schedule,
          },
        });
      }
    );

    return getActionResponse({ data: classroom });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const updateClassroom = async (
  classroomId: string,
  data: {
    name?: string;
    grade?: string;
    subject?: string;
    teacherId?: string;
    capacity?: number;
    room?: string;
    schedule?: Prisma.InputJsonValue;
  }
): Promise<ActionResponse<Classroom>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const existingClassroom = await db.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!existingClassroom) {
      throw new Error("Classroom not found");
    }

    const classroom = await withCampusPermission(
      session.user.id,
      existingClassroom.campusId,
      "classroom",
      "update",
      async () => {
        return await db.classroom.update({
          where: { id: classroomId },
          data,
        });
      }
    );

    return getActionResponse({ data: classroom });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const enrollStudentInClassroom = async (
  studentId: string,
  classroomId: string
): Promise<ActionResponse<{ success: boolean }>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const classroom = await db.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    await withCampusPermission(
      session.user.id,
      classroom.campusId,
      "classroom",
      "update",
      async () => {
        return await db.classroomEnrollment.create({
          data: {
            classroomId,
            studentId,
          },
        });
      }
    );

    return getActionResponse({ data: { success: true } });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const removeStudentFromClassroom = async (
  studentId: string,
  classroomId: string
): Promise<ActionResponse<{ success: boolean }>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const classroom = await db.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    await withCampusPermission(
      session.user.id,
      classroom.campusId,
      "classroom",
      "update",
      async () => {
        return await db.classroomEnrollment.deleteMany({
          where: {
            classroomId,
            studentId,
          },
        });
      }
    );

    return getActionResponse({ data: { success: true } });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getClassroomRoster = async (
  classroomId: string
): Promise<ActionResponse<Array<Student & { user: User }>>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const classroom = await db.classroom.findUnique({
      where: { id: classroomId },
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

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    const roster = classroom.students.map((enrollment) => enrollment.student);

    return getActionResponse({ data: roster });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const assignTeacherToClassroom = async (
  teacherId: string,
  classroomId: string
): Promise<ActionResponse<Classroom>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { db } = await getAuthenticatedClient();

    const classroom = await db.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    const updatedClassroom = await withCampusPermission(
      session.user.id,
      classroom.campusId,
      "classroom",
      "update",
      async () => {
        return await db.classroom.update({
          where: { id: classroomId },
          data: { teacherId },
        });
      }
    );

    return getActionResponse({ data: updatedClassroom });
  } catch (error) {
    return getActionResponse({ error });
  }
};
