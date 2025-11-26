import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    const { email, cleanupOrphanedOrgs } = await request.json();

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
