"use server";

import { getAuthenticatedClient } from "@/lib/auth.utils";
import { ActionResponse } from "@/lib/action.utils";

export async function assignGradeAction(
  studentId: string,
  classroomId: string,
  subject: string,
  grade: string,
  gradingPeriod: string,
  comments?: string
): Promise<ActionResponse<{ id: string }>> {
  const { db, userId } = await getAuthenticatedClient();

  const classroom = await db.classroom.findFirst({
    where: { id: classroomId },
    select: { campusId: true, teacherId: true },
  });

  if (!classroom) {
    return { error: "Classroom not found" };
  }

  const teacher = await db.teacher.findFirst({
    where: { userId },
    select: { id: true },
  });

  if (!teacher) {
    return { error: "Teacher profile not found" };
  }

  const gradeRecord = await db.grade.create({
    data: {
      studentId,
      classroomId,
      subject,
      grade,
      gradingPeriod,
      teacherId: teacher.id,
      comments,
      campusId: classroom.campusId,
    },
  });

  return { data: { id: gradeRecord.id } };
}

export async function updateGradeAction(
  gradeId: string,
  data: {
    grade?: string;
    gradingPeriod?: string;
    comments?: string;
  }
): Promise<ActionResponse<{ id: string }>> {
  const { db } = await getAuthenticatedClient();

  const gradeRecord = await db.grade.update({
    where: { id: gradeId },
    data,
  });

  return { data: { id: gradeRecord.id } };
}

export async function getGradesByStudentAction(
  studentId: string,
  gradingPeriod?: string
): Promise<ActionResponse<any[]>> {
  const { db } = await getAuthenticatedClient();

  const grades = await db.grade.findMany({
    where: {
      studentId,
      ...(gradingPeriod && { gradingPeriod }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { data: grades };
}

export async function getGradesByClassroomAction(
  classroomId: string,
  gradingPeriod?: string
): Promise<ActionResponse<any[]>> {
  const { db } = await getAuthenticatedClient();

  const grades = await db.grade.findMany({
    where: {
      classroomId,
      ...(gradingPeriod && { gradingPeriod }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { data: grades };
}

export async function getGradeStatsAction(
  studentId: string
): Promise<
  ActionResponse<{
    totalGrades: number;
    averageGrade: number;
    gradesBySubject: Record<string, number>;
  }>
> {
  const { db } = await getAuthenticatedClient();

  const grades = await db.grade.findMany({
    where: { studentId },
  });

  const totalGrades = grades.length;

  const gradeValues = grades
    .map((g) => {
      const numericGrade = parseFloat(g.grade);
      return isNaN(numericGrade) ? null : numericGrade;
    })
    .filter((v): v is number => v !== null);

  const averageGrade =
    gradeValues.length > 0
      ? gradeValues.reduce((sum, val) => sum + val, 0) / gradeValues.length
      : 0;

  const gradesBySubject: Record<string, number> = {};
  grades.forEach((g) => {
    if (!gradesBySubject[g.subject]) {
      gradesBySubject[g.subject] = 0;
    }
    const numericGrade = parseFloat(g.grade);
    if (!isNaN(numericGrade)) {
      gradesBySubject[g.subject] =
        (gradesBySubject[g.subject] + numericGrade) / 2;
    }
  });

  return {
    data: {
      totalGrades,
      averageGrade: Math.round(averageGrade * 100) / 100,
      gradesBySubject,
    },
  };
}

export async function deleteGradeAction(
  gradeId: string
): Promise<ActionResponse<{ success: boolean }>> {
  const { db } = await getAuthenticatedClient();

  await db.grade.delete({
    where: { id: gradeId },
  });

  return { data: { success: true } };
}
