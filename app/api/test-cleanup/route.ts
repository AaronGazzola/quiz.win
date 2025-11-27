import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

const SEEDED_QUIZ_TITLES = [
  "Patient Safety Protocols",
  "HIPAA Compliance Fundamentals",
  "Medical Terminology Basics",
  "Cybersecurity Best Practices",
  "Agile Project Management",
  "Software Development Lifecycle",
];

const SEEDED_ORG_SLUGS = ["healthcare-partners", "techcorp-solutions"];

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    const { email, cleanupOrphanedOrgs, quizTitlePrefix, cleanupSeededOrgQuizzes } =
      await request.json();

    if (cleanupSeededOrgQuizzes) {
      const seededOrgs = await prisma.organization.findMany({
        where: { slug: { in: SEEDED_ORG_SLUGS } },
        select: { id: true },
      });

      const seededOrgIds = seededOrgs.map((org) => org.id);

      const deletedQuizzes = await prisma.quiz.deleteMany({
        where: {
          organizationId: { in: seededOrgIds },
          title: { notIn: SEEDED_QUIZ_TITLES },
        },
      });

      return NextResponse.json({
        message: "Seeded org quiz cleanup successful",
        deletedQuizzes: deletedQuizzes.count,
      });
    }

    if (quizTitlePrefix) {
      const deletedQuizzes = await prisma.quiz.deleteMany({
        where: {
          title: { startsWith: quizTitlePrefix },
        },
      });
      return NextResponse.json({
        message: "Quiz cleanup successful",
        deletedQuizzes: deletedQuizzes.count,
      });
    }

    if (cleanupOrphanedOrgs) {
      const orphanedOrgs = await prisma.organization.deleteMany({
        where: {
          slug: { startsWith: "test-user-" },
          member: { none: {} },
        },
      });
      return NextResponse.json({
        message: "Orphaned org cleanup successful",
        deletedOrganizations: orphanedOrgs.count,
      });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        member: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found, nothing to clean up" });
    }

    const orgIds = user.member.map((m) => m.organizationId);
    const singleMemberOrgIds: string[] = [];

    for (const orgId of orgIds) {
      const memberCount = await prisma.member.count({
        where: { organizationId: orgId },
      });
      if (memberCount === 1) {
        singleMemberOrgIds.push(orgId);
      }
    }

    if (singleMemberOrgIds.length > 0) {
      await prisma.organization.deleteMany({
        where: { id: { in: singleMemberOrgIds } },
      });
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({
      message: "Cleanup successful",
      deletedUser: user.email,
      deletedOrganizations: singleMemberOrgIds.length,
    });
  } catch (error) {
    console.error("Test cleanup error:", error);
    return NextResponse.json(
      { error: "Cleanup failed", details: String(error) },
      { status: 500 }
    );
  }
}
