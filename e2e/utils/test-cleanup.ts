import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanupTestUser(email: string) {
  await prisma.response.deleteMany({
    where: {
      profile: {
        user: {
          email,
        },
      },
    },
  });

  await prisma.profile.deleteMany({
    where: {
      user: {
        email,
      },
    },
  });

  await prisma.session.deleteMany({
    where: {
      user: {
        email,
      },
    },
  });

  await prisma.account.deleteMany({
    where: {
      user: {
        email,
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: { email },
    include: { members: true },
  });

  if (user) {
    await prisma.member.deleteMany({
      where: { userId: user.id },
    });

    await prisma.invitation.deleteMany({
      where: {
        OR: [{ email }, { organizationId: { in: user.members.map((m) => m.organizationId) } }],
      },
    });
  }

  await prisma.user.deleteMany({
    where: { email },
  });
}

export async function cleanupTestOrganization(slug: string) {
  const org = await prisma.organization.findUnique({
    where: { slug },
    include: { quizzes: { include: { questions: true } }, members: true },
  });

  if (!org) return;

  const quizIds = org.quizzes.map((q) => q.id);

  await prisma.response.deleteMany({
    where: { quizId: { in: quizIds } },
  });

  await prisma.question.deleteMany({
    where: { quizId: { in: quizIds } },
  });

  await prisma.quiz.deleteMany({
    where: { organizationId: org.id },
  });

  await prisma.invitation.deleteMany({
    where: { organizationId: org.id },
  });

  await prisma.member.deleteMany({
    where: { organizationId: org.id },
  });

  await prisma.organization.deleteMany({
    where: { id: org.id },
  });
}

export async function cleanupTestQuiz(title: string, organizationId: string) {
  const quiz = await prisma.quiz.findFirst({
    where: {
      title,
      organizationId,
    },
  });

  if (!quiz) return;

  await prisma.response.deleteMany({
    where: { quizId: quiz.id },
  });

  await prisma.question.deleteMany({
    where: { quizId: quiz.id },
  });

  await prisma.quiz.deleteMany({
    where: { id: quiz.id },
  });
}

export async function cleanupAllTestData(testEmailPattern: string = "test@") {
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: testEmailPattern,
      },
    },
  });

  for (const user of users) {
    await cleanupTestUser(user.email);
  }

  const testOrgs = await prisma.organization.findMany({
    where: {
      OR: [
        { name: { contains: "Test" } },
        { slug: { contains: "test" } },
      ],
    },
  });

  for (const org of testOrgs) {
    await cleanupTestOrganization(org.slug);
  }
}

export { prisma };
