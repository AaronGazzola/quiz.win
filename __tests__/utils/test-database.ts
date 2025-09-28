import { PrismaClient } from "@prisma/client";

const TEST_EMAIL_DOMAIN = "realtest.example.com";

let testPrisma: PrismaClient | null = null;

export const getTestPrismaClient = () => {
  if (!testPrisma) {
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
        },
      },
      log: ['error', 'warn'],
    });
  }
  return testPrisma;
};

export const cleanTestDatabase = async () => {
  const prisma = getTestPrismaClient();

  await prisma.response.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.member.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.magicLink.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
};

export const disconnectTestDatabase = async () => {
  if (testPrisma) {
    await testPrisma.$disconnect();
    testPrisma = null;
  }
};

export interface TestUserData {
  id: string;
  email: string;
  name: string;
  role: string;
  password: string;
}

export interface TestOrganizationData {
  id: string;
  name: string;
  slug: string;
}

export interface TestMembershipData {
  userId: string;
  organizationId: string;
  role: string;
}

export const seedTestDatabase = async () => {
  const prisma = getTestPrismaClient();

  await cleanTestDatabase();

  const usersData = [
    {
      email: `superadmin@${TEST_EMAIL_DOMAIN}`,
      name: "Super Admin User",
      role: "super-admin",
    },
    {
      email: `orgA-admin@${TEST_EMAIL_DOMAIN}`,
      name: "Organization A Admin",
      role: "user",
    },
    {
      email: `orgA-member@${TEST_EMAIL_DOMAIN}`,
      name: "Organization A Member",
      role: "user",
    },
    {
      email: `orgB-admin@${TEST_EMAIL_DOMAIN}`,
      name: "Organization B Admin",
      role: "user",
    },
    {
      email: `orgB-member@${TEST_EMAIL_DOMAIN}`,
      name: "Organization B Member",
      role: "user",
    },
    {
      email: `unaffiliated@${TEST_EMAIL_DOMAIN}`,
      name: "Unaffiliated User",
      role: "user",
    },
  ];

  const users: TestUserData[] = [];
  for (const userData of usersData) {
    try {
      const createdUser = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      users.push({
        id: createdUser.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        password: "Password123!",
      });
    } catch (error) {
      console.error(`Error creating user ${userData.email}:`, error);
      throw error;
    }
  }

  const organizations: TestOrganizationData[] = await Promise.all([
    prisma.organization.create({
      data: {
        name: "Test Organization A",
        slug: "test-org-a",
        metadata: { testOrg: true },
      },
    }).then(org => ({ id: org.id, name: org.name, slug: org.slug })),

    prisma.organization.create({
      data: {
        name: "Test Organization B",
        slug: "test-org-b",
        metadata: { testOrg: true },
      },
    }).then(org => ({ id: org.id, name: org.name, slug: org.slug })),
  ]);

  const memberships: TestMembershipData[] = [
    { userId: users[1].id, organizationId: organizations[0].id, role: "admin" },
    { userId: users[2].id, organizationId: organizations[0].id, role: "member" },
    { userId: users[3].id, organizationId: organizations[1].id, role: "admin" },
    { userId: users[4].id, organizationId: organizations[1].id, role: "member" },
  ];

  await Promise.all(
    memberships.map(membership =>
      prisma.member.create({ data: membership })
    )
  );

  await Promise.all(
    users.map(user =>
      prisma.profile.create({
        data: {
          userId: user.id,
          preferences: { theme: "light", testProfile: true },
        },
      })
    )
  );

  const quizzes = await Promise.all([
    prisma.quiz.create({
      data: {
        title: "Test Quiz A1",
        description: "First quiz for Organization A",
        organizationId: organizations[0].id,
        createdBy: users[1].id,
        isActive: true,
      },
    }),
    prisma.quiz.create({
      data: {
        title: "Test Quiz A2",
        description: "Second quiz for Organization A",
        organizationId: organizations[0].id,
        createdBy: users[1].id,
        isActive: false,
      },
    }),
    prisma.quiz.create({
      data: {
        title: "Test Quiz B1",
        description: "First quiz for Organization B",
        organizationId: organizations[1].id,
        createdBy: users[3].id,
        isActive: true,
      },
    }),
  ]);

  await Promise.all(
    quizzes.flatMap((quiz, quizIndex) =>
      Array.from({ length: 2 }, (_, qIndex) =>
        prisma.question.create({
          data: {
            quizId: quiz.id,
            question: `Test question ${qIndex + 1} for ${quiz.title}`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            order: qIndex + 1,
          },
        })
      )
    )
  );

  const responses = [
    {
      quizId: quizzes[0].id,
      userId: users[2].id,
      answers: { "1": "Option A", "2": "Option B" },
      score: 75.0,
    },
    {
      quizId: quizzes[2].id,
      userId: users[4].id,
      answers: { "1": "Option A", "2": "Option A" },
      score: 100.0,
    },
  ];

  await Promise.all(
    responses.map(response =>
      prisma.response.create({ data: response })
    )
  );

  return {
    users,
    organizations,
    memberships,
    quizzes,
  };
};

export interface TestContext {
  userId: string | null;
  userEmail?: string;
  role?: string;
  organizationMemberships?: Array<{
    organizationId: string;
    role: string;
  }>;
}

export const createTestContext = (
  users: TestUserData[],
  memberships: TestMembershipData[],
  userEmail?: string
): TestContext => {
  if (!userEmail) {
    return { userId: null };
  }

  const user = users.find(u => u.email === userEmail);
  if (!user) {
    return { userId: null };
  }

  const userMemberships = memberships.filter(m => m.userId === user.id);

  return {
    userId: user.id,
    userEmail: user.email,
    role: user.role,
    organizationMemberships: userMemberships.map(m => ({
      organizationId: m.organizationId,
      role: m.role,
    })),
  };
};

export const authenticateAsUser = async (userEmail: string, password: string = "Password123!") => {
  console.log(`Mock authentication for ${userEmail} - Real auth testing requires better-auth ES module fixes`);
  return { user: { email: userEmail }, session: { token: "mock-token" } };
};