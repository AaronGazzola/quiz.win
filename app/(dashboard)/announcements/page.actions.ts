"use server";

import { getAuthenticatedClient } from "@/lib/auth.utils";
import { validateCampusAccess, canManageContent } from "@/lib/data-access";
import { TargetAudience } from "@prisma/client";

export async function getAnnouncementsAction(campusId: string, userId: string) {
  const { db, user } = await getAuthenticatedClient();

  if (!user) throw new Error("Unauthorized");

  const campusAccess = await validateCampusAccess(
    user.id,
    campusId,
    "read"
  );

  if (!campusAccess) {
    throw new Error("Campus access denied");
  }

  const userWithProfile = await db.user.findUnique({
    where: { id: userId },
    include: {
      teacherProfile: true,
      parentProfile: {
        include: {
          students: {
            include: {
              student: true,
            },
          },
        },
      },
      studentProfile: true,
    },
  });

  let announcements = await db.announcement.findMany({
    where: {
      campusId,
    },
    orderBy: [
      { isPinned: "desc" },
      { publishedAt: "desc" },
    ],
  });

  if (userWithProfile?.userType === "Parent") {
    const studentGrades = userWithProfile.parentProfile?.students.map(
      (sp) => sp.student.grade
    ) || [];
    const studentClassrooms = await db.classroomEnrollment.findMany({
      where: {
        studentId: {
          in: userWithProfile.parentProfile?.students.map((sp) => sp.studentId) || [],
        },
      },
      select: {
        classroomId: true,
      },
    });
    const classroomIds = studentClassrooms.map((ce) => ce.classroomId);

    announcements = announcements.filter(
      (a) =>
        a.targetAudience === "AllParents" ||
        (a.targetAudience === "Grade" && studentGrades.includes(a.grade!)) ||
        (a.targetAudience === "Classroom" && classroomIds.includes(a.classroomId!))
    );
  } else if (userWithProfile?.userType === "Teacher") {
    announcements = announcements.filter(
      (a) =>
        a.targetAudience === "AllTeachers" ||
        a.targetAudience === "AllParents"
    );
  }

  return announcements;
}

export async function createAnnouncementAction(data: {
  title: string;
  content: string;
  targetAudience: TargetAudience;
  classroomId?: string;
  grade?: string;
  isPinned?: boolean;
}) {
  const { db, user, session } = await getAuthenticatedClient();

  if (!user || !session?.session?.activeOrganizationId) throw new Error("Unauthorized");

  const campusAccess = await validateCampusAccess(
    user.id,
    session.session.activeOrganizationId,
    "write"
  );

  if (!campusAccess) {
    throw new Error("Campus access denied");
  }

  const canManage = await canManageContent(
    user.id,
    session.session.activeOrganizationId
  );

  if (!canManage) {
    throw new Error("Only admins and teachers can create announcements");
  }

  const announcement = await db.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      authorId: user.id,
      campusId: session.session.activeOrganizationId,
      targetAudience: data.targetAudience,
      classroomId: data.classroomId,
      grade: data.grade,
      isPinned: data.isPinned || false,
    },
  });

  return announcement;
}

export async function updateAnnouncementAction(
  announcementId: string,
  data: {
    title?: string;
    content?: string;
    targetAudience?: TargetAudience;
    classroomId?: string;
    grade?: string;
    isPinned?: boolean;
  }
) {
  const { db, user } = await getAuthenticatedClient();

  if (!user) throw new Error("Unauthorized");

  const announcement = await db.announcement.findUnique({
    where: { id: announcementId },
  });

  if (!announcement) {
    throw new Error("Announcement not found");
  }

  const campusAccess = await validateCampusAccess(
    user.id,
    announcement.campusId,
    "write"
  );

  if (!campusAccess) {
    throw new Error("Campus access denied");
  }

  if (announcement.authorId !== user.id) {
    const canManage = await canManageContent(
      user.id,
      announcement.campusId
    );
    if (!canManage) {
      throw new Error("Unauthorized to update this announcement");
    }
  }

  const updated = await db.announcement.update({
    where: { id: announcementId },
    data,
  });

  return updated;
}

export async function deleteAnnouncementAction(announcementId: string) {
  const { db, user } = await getAuthenticatedClient();

  if (!user) throw new Error("Unauthorized");

  const announcement = await db.announcement.findUnique({
    where: { id: announcementId },
  });

  if (!announcement) {
    throw new Error("Announcement not found");
  }

  const campusAccess = await validateCampusAccess(
    user.id,
    announcement.campusId,
    "write"
  );

  if (!campusAccess) {
    throw new Error("Campus access denied");
  }

  if (announcement.authorId !== user.id) {
    const canManage = await canManageContent(
      user.id,
      announcement.campusId
    );
    if (!canManage) {
      throw new Error("Unauthorized to delete this announcement");
    }
  }

  await db.announcement.delete({
    where: { id: announcementId },
  });

  return { success: true };
}

export async function pinAnnouncementAction(announcementId: string) {
  const { db, user } = await getAuthenticatedClient();

  if (!user) throw new Error("Unauthorized");

  const announcement = await db.announcement.findUnique({
    where: { id: announcementId },
  });

  if (!announcement) {
    throw new Error("Announcement not found");
  }

  const canManage = await canManageContent(
    user.id,
    announcement.campusId
  );

  if (!canManage) {
    throw new Error("Only admins can pin announcements");
  }

  const updated = await db.announcement.update({
    where: { id: announcementId },
    data: { isPinned: !announcement.isPinned },
  });

  return updated;
}
