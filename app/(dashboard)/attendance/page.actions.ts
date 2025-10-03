"use server";

import { getAuthenticatedClient } from "@/lib/auth.utils";
import { ActionResponse } from "@/lib/action.utils";
import { AttendanceStatus } from "@prisma/client";

export async function createAttendanceSessionAction(
  classroomId: string,
  date: Date
): Promise<ActionResponse<{ id: string }>> {
  const { db, userId } = await getAuthenticatedClient();

  const classroom = await db.classroom.findFirst({
    where: { id: classroomId },
    select: { campusId: true, teacherId: true },
  });

  if (!classroom) {
    return { error: "Classroom not found" };
  }

  const session = await db.attendanceSession.create({
    data: {
      classroomId,
      date,
      campusId: classroom.campusId,
      markedById: userId,
    },
  });

  return { data: { id: session.id } };
}

export async function markAttendanceAction(
  sessionId: string,
  studentId: string,
  status: AttendanceStatus,
  notes?: string
): Promise<ActionResponse<{ id: string }>> {
  const { db } = await getAuthenticatedClient();

  const record = await db.attendanceRecord.upsert({
    where: {
      sessionId_studentId: {
        sessionId,
        studentId,
      },
    },
    create: {
      sessionId,
      studentId,
      status,
      notes,
    },
    update: {
      status,
      notes,
    },
  });

  return { data: { id: record.id } };
}

export async function bulkMarkAttendanceAction(
  sessionId: string,
  records: Array<{ studentId: string; status: AttendanceStatus; notes?: string }>
): Promise<ActionResponse<{ count: number }>> {
  const { db } = await getAuthenticatedClient();

  const results = await Promise.all(
    records.map((record) =>
      db.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: record.studentId,
          },
        },
        create: {
          sessionId,
          studentId: record.studentId,
          status: record.status,
          notes: record.notes,
        },
        update: {
          status: record.status,
          notes: record.notes,
        },
      })
    )
  );

  return { data: { count: results.length } };
}

export async function getAttendanceByClassroomAction(
  classroomId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ActionResponse<any[]>> {
  const { db } = await getAuthenticatedClient();

  const sessions = await db.attendanceSession.findMany({
    where: {
      classroomId,
      ...(startDate &&
        endDate && {
          date: {
            gte: startDate,
            lte: endDate,
          },
        }),
    },
    include: {
      records: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return { data: sessions };
}

export async function getStudentAttendanceAction(
  studentId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ActionResponse<any[]>> {
  const { db } = await getAuthenticatedClient();

  const records = await db.attendanceRecord.findMany({
    where: {
      studentId,
      ...(startDate &&
        endDate && {
          session: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
    },
    include: {
      session: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { data: records };
}

export async function getAttendanceStatsAction(
  studentId: string
): Promise<
  ActionResponse<{
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  }>
> {
  const { db } = await getAuthenticatedClient();

  const records = await db.attendanceRecord.findMany({
    where: { studentId },
  });

  const total = records.length;
  const present = records.filter((r) => r.status === "Present").length;
  const absent = records.filter((r) => r.status === "Absent").length;
  const late = records.filter((r) => r.status === "Late").length;
  const percentage = total > 0 ? (present / total) * 100 : 0;

  return {
    data: {
      total,
      present,
      absent,
      late,
      percentage: Math.round(percentage * 100) / 100,
    },
  };
}

export async function getAttendanceSessionAction(
  sessionId: string
): Promise<ActionResponse<any>> {
  const { db } = await getAuthenticatedClient();

  const session = await db.attendanceSession.findUnique({
    where: { id: sessionId },
    include: {
      records: true,
    },
  });

  if (!session) {
    return { error: "Session not found" };
  }

  return { data: session };
}
