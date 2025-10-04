/*
  Warnings:

  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "auth"."UserType" AS ENUM ('Teacher', 'Parent', 'Student', 'Admin');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('Present', 'Absent', 'Late');

-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('Holiday', 'ParentTeacherConference', 'Assembly', 'FieldTrip', 'ExamPeriod', 'Other');

-- CreateEnum
CREATE TYPE "public"."TargetAudience" AS ENUM ('AllParents', 'AllTeachers', 'Classroom', 'Grade');

-- DropForeignKey
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Response" DROP CONSTRAINT "Response_quizId_fkey";

-- AlterTable
ALTER TABLE "auth"."organization" ADD COLUMN     "address" TEXT,
ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "principalName" TEXT;

-- AlterTable
ALTER TABLE "auth"."user" ADD COLUMN     "emergencyContact" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "userType" "auth"."UserType";

-- DropTable
DROP TABLE "public"."Quiz";

-- CreateTable
CREATE TABLE "public"."Password" (
    "id" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Password_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "targetAudience" "public"."TargetAudience" NOT NULL,
    "classroomId" TEXT,
    "grade" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AttendanceRecord" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AttendanceSession" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "campusId" TEXT NOT NULL,
    "markedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CafeteriaMenu" (
    "id" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "dayOfWeek" "public"."DayOfWeek" NOT NULL,
    "menuItems" JSONB NOT NULL,
    "specialNotes" TEXT,
    "campusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CafeteriaMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CalendarEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "public"."EventType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "campusId" TEXT NOT NULL,
    "isSchoolClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Classroom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "capacity" INTEGER,
    "room" TEXT,
    "schedule" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClassroomEnrollment" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Grade" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "gradingPeriod" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "comments" TEXT,
    "campusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "campusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Parent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "primaryContact" BOOLEAN NOT NULL DEFAULT false,
    "relationship" TEXT NOT NULL,
    "occupation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campusId" TEXT NOT NULL,
    "authorizedPickups" JSONB,
    "medicalInfo" JSONB,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentParent" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentParent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Teacher" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certifications" TEXT[],
    "subjects" TEXT[],
    "employeeId" TEXT,
    "cvUrl" TEXT,
    "campusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "subject" TEXT,
    "gradeLevel" TEXT,
    "classroomId" TEXT,
    "assignedTo" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_sessionId_studentId_key" ON "public"."AttendanceRecord"("sessionId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "CafeteriaMenu_campusId_weekStartDate_dayOfWeek_key" ON "public"."CafeteriaMenu"("campusId", "weekStartDate", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomEnrollment_classroomId_studentId_key" ON "public"."ClassroomEnrollment"("classroomId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_userId_key" ON "public"."Parent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "public"."Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentParent_studentId_parentId_key" ON "public"."StudentParent"("studentId", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "public"."Teacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_employeeId_key" ON "public"."Teacher"("employeeId");

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AttendanceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Classroom" ADD CONSTRAINT "Classroom_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "auth"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Classroom" ADD CONSTRAINT "Classroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassroomEnrollment" ADD CONSTRAINT "ClassroomEnrollment_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "public"."Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassroomEnrollment" ADD CONSTRAINT "ClassroomEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Parent" ADD CONSTRAINT "Parent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "auth"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentParent" ADD CONSTRAINT "StudentParent_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentParent" ADD CONSTRAINT "StudentParent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Teacher" ADD CONSTRAINT "Teacher_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "auth"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz" ADD CONSTRAINT "quiz_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "auth"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
