import { PrismaClient } from "@prisma/client";
import { auth } from "../lib/auth";
import "better-auth/node";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const fromEmailDomain = process.env.NEXT_PUBLIC_TEST_USER_EMAIL_DOMAIN;
  const devPassword = process.env.DEV_PASSWORD;

  if (!fromEmailDomain) {
    console.error(
      "NEXT_PUBLIC_TEST_USER_EMAIL_DOMAIN environment variable is required"
    );
    process.exit(1);
  }

  if (!devPassword) {
    console.error("DEV_PASSWORD environment variable is required");
    process.exit(1);
  }

  console.log("🌱 Starting database seed...");

  try {
    console.log("🧹 Cleaning existing data...");
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
    await prisma.password.deleteMany();

    console.log("🔐 Hashing password and storing in database...");
    const passwordHash = await bcrypt.hash(devPassword, 10);
    await prisma.password.create({
      data: {
        hash: passwordHash,
        length: devPassword.length,
      },
    });

    console.log("👥 Creating users...");

    const usersData = [
      {
        email: `superadmin@${fromEmailDomain}`,
        name: "System Administrator",
        role: "super-admin",
      },
      {
        email: `lagos.admin@${fromEmailDomain}`,
        name: "Dr. Adebayo Okonkwo",
        role: "admin",
      },
      {
        email: `abuja.admin@${fromEmailDomain}`,
        name: "Mrs. Chimamanda Nwosu",
        role: "admin",
      },
      {
        email: `sarah.mathematics@${fromEmailDomain}`,
        name: "Mrs. Sarah Johnson",
        role: "teacher",
      },
      {
        email: `james.science@${fromEmailDomain}`,
        name: "Mr. James Anderson",
        role: "teacher",
      },
      {
        email: `emily.english@${fromEmailDomain}`,
        name: "Ms. Emily Chen",
        role: "teacher",
      },
      {
        email: `michael.history@${fromEmailDomain}`,
        name: "Mr. Michael Brown",
        role: "teacher",
      },
      {
        email: `david.parent@${fromEmailDomain}`,
        name: "David Williams",
        role: "parent",
      },
      {
        email: `mary.parent@${fromEmailDomain}`,
        name: "Mary Thompson",
        role: "parent",
      },
      {
        email: `john.parent@${fromEmailDomain}`,
        name: "John Davis",
        role: "parent",
      },
      {
        email: `sophia.student@${fromEmailDomain}`,
        name: "Sophia Williams",
        role: "student",
      },
      {
        email: `oliver.student@${fromEmailDomain}`,
        name: "Oliver Thompson",
        role: "student",
      },
      {
        email: `emma.student@${fromEmailDomain}`,
        name: "Emma Davis",
        role: "student",
      },
      {
        email: `liam.student@${fromEmailDomain}`,
        name: "Liam Martinez",
        role: "student",
      },
      {
        email: `ava.student@${fromEmailDomain}`,
        name: "Ava Garcia",
        role: "student",
      },
    ];

    const users = [];
    for (const userData of usersData) {
      console.log(`Creating user: ${userData.email}`);

      const signupRequest = new Request(`${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: devPassword,
          name: userData.name,
        }),
      });

      const response = await auth.handler(signupRequest);
      const result = await response.json();

      if (!result.user) {
        throw new Error(`Failed to create user: ${userData.email}`);
      }

      users.push(result.user);

      if (userData.role) {
        await prisma.user.update({
          where: { id: result.user.id },
          data: { role: userData.role },
        });
      }

      await prisma.user.update({
        where: { id: result.user.id },
        data: { emailVerified: true },
      });
    }

    console.log("🏢 Creating campuses...");
    const organizations = await Promise.all([
      prisma.organization.create({
        data: {
          name: "Abraham Lincoln Academy - Lagos Campus",
          slug: "alaa-lagos",
          metadata: {
            description: "Premier American-curriculum school in Lagos, Nigeria",
            location: "Victoria Island, Lagos",
            principal: "Dr. Adebayo Okonkwo",
            capacity: 500,
            phone: "+234-1-234-5678",
          },
        },
      }),
      prisma.organization.create({
        data: {
          name: "Abraham Lincoln Academy - Abuja Campus",
          slug: "alaa-abuja",
          metadata: {
            description: "Premier American-curriculum school in Abuja, Nigeria",
            location: "Maitama District, Abuja",
            principal: "Mrs. Chimamanda Nwosu",
            capacity: 400,
            phone: "+234-9-876-5432",
          },
        },
      }),
    ]);

    console.log("👤 Creating user profiles...");
    await Promise.all(
      users.map((user) =>
        prisma.profile.create({
          data: {
            userId: user.id,
            preferences: {
              theme: "light",
              notifications: true,
              language: "en",
            },
          },
        })
      )
    );

    console.log("🤝 Creating campus memberships...");
    const memberships = [
      { userId: users[1].id, organizationId: organizations[0].id, role: "admin" },
      { userId: users[3].id, organizationId: organizations[0].id, role: "teacher" },
      { userId: users[4].id, organizationId: organizations[0].id, role: "teacher" },
      { userId: users[5].id, organizationId: organizations[0].id, role: "teacher" },
      { userId: users[7].id, organizationId: organizations[0].id, role: "parent" },
      { userId: users[8].id, organizationId: organizations[0].id, role: "parent" },
      { userId: users[10].id, organizationId: organizations[0].id, role: "student" },
      { userId: users[11].id, organizationId: organizations[0].id, role: "student" },
      { userId: users[12].id, organizationId: organizations[0].id, role: "student" },
      { userId: users[2].id, organizationId: organizations[1].id, role: "admin" },
      { userId: users[6].id, organizationId: organizations[1].id, role: "teacher" },
      { userId: users[9].id, organizationId: organizations[1].id, role: "parent" },
      { userId: users[13].id, organizationId: organizations[1].id, role: "student" },
      { userId: users[14].id, organizationId: organizations[1].id, role: "student" },
    ];

    await Promise.all(
      memberships.map((membership) =>
        prisma.member.create({
          data: membership,
        })
      )
    );

    console.log("📝 Creating assessments...");
    const quizzes = await Promise.all([
      prisma.quiz.create({
        data: {
          title: "Grade 3 Mathematics - Week 1",
          description: "Basic arithmetic and number recognition assessment",
          organizationId: organizations[0].id,
          createdBy: users[3].id,
          isActive: true,
        },
      }),
      prisma.quiz.create({
        data: {
          title: "Grade 4 Science - States of Matter",
          description: "Understanding solids, liquids, and gases",
          organizationId: organizations[0].id,
          createdBy: users[4].id,
          isActive: true,
        },
      }),
      prisma.quiz.create({
        data: {
          title: "Grade 5 English - Reading Comprehension",
          description: "Understanding main ideas and supporting details",
          organizationId: organizations[0].id,
          createdBy: users[5].id,
          isActive: true,
        },
      }),
      prisma.quiz.create({
        data: {
          title: "Grade 6 History - Ancient Civilizations",
          description: "Early civilizations and their contributions",
          organizationId: organizations[1].id,
          createdBy: users[6].id,
          isActive: true,
        },
      }),
    ]);

    console.log("❓ Creating questions...");
    const questionSets = [
      {
        quizId: quizzes[0].id,
        questions: [
          {
            question: "What is 5 + 3?",
            options: ["6", "7", "8", "9"],
            correctAnswer: "8",
            order: 1,
          },
          {
            question: "Which number comes after 19?",
            options: ["18", "20", "21", "22"],
            correctAnswer: "20",
            order: 2,
          },
          {
            question: "What is 10 - 4?",
            options: ["4", "5", "6", "7"],
            correctAnswer: "6",
            order: 3,
          },
        ],
      },
      {
        quizId: quizzes[1].id,
        questions: [
          {
            question: "Which of these is a liquid?",
            options: ["Ice", "Water", "Steam", "Rock"],
            correctAnswer: "Water",
            order: 1,
          },
          {
            question: "What happens when you heat ice?",
            options: [
              "It stays the same",
              "It becomes water",
              "It becomes steam",
              "It disappears",
            ],
            correctAnswer: "It becomes water",
            order: 2,
          },
          {
            question: "Which is an example of a gas?",
            options: ["Water", "Wood", "Air", "Metal"],
            correctAnswer: "Air",
            order: 3,
          },
        ],
      },
      {
        quizId: quizzes[2].id,
        questions: [
          {
            question: "What is the main idea of a story usually found in?",
            options: [
              "The title",
              "The first paragraph",
              "The last sentence",
              "The pictures",
            ],
            correctAnswer: "The first paragraph",
            order: 1,
          },
          {
            question: "What are supporting details?",
            options: [
              "The title of the story",
              "Facts that support the main idea",
              "The author's name",
              "The number of pages",
            ],
            correctAnswer: "Facts that support the main idea",
            order: 2,
          },
        ],
      },
      {
        quizId: quizzes[3].id,
        questions: [
          {
            question: "Which civilization built the pyramids?",
            options: ["Romans", "Greeks", "Egyptians", "Mayans"],
            correctAnswer: "Egyptians",
            order: 1,
          },
          {
            question: "What did ancient Mesopotamians invent?",
            options: ["The wheel", "The airplane", "The computer", "The phone"],
            correctAnswer: "The wheel",
            order: 2,
          },
          {
            question: "Where did ancient Greek civilization develop?",
            options: ["Egypt", "Greece", "Rome", "China"],
            correctAnswer: "Greece",
            order: 3,
          },
        ],
      },
    ];

    console.log("❓ Creating questions and storing references...");
    const createdQuestions: Record<string, Array<{ id: string; question: string; correctAnswer: string; order: number }>> = {};

    for (const questionSet of questionSets) {
      const questions = await Promise.all(
        questionSet.questions.map((question) =>
          prisma.question.create({
            data: {
              ...question,
              quizId: questionSet.quizId,
            },
          })
        )
      );
      createdQuestions[questionSet.quizId] = questions.map(q => ({
        id: q.id,
        question: q.question,
        correctAnswer: q.correctAnswer,
        order: q.order
      }));
    }

    console.log("📊 Creating student assessment responses...");

    const createAnswersArray = (quizId: string, answersByOrder: Record<string, string>) => {
      const questions = createdQuestions[quizId];
      return questions.map(question => {
        const selectedAnswer = answersByOrder[question.order.toString()] || null;
        return {
          questionId: question.id,
          selectedAnswer,
          isCorrect: selectedAnswer === question.correctAnswer
        };
      });
    };

    const responses = [
      {
        quizId: quizzes[0].id,
        userId: users[10].id,
        answers: createAnswersArray(quizzes[0].id, {
          "1": "8",
          "2": "20",
          "3": "6",
        }),
        score: 1.0,
        completedAt: new Date("2025-01-15T10:30:00Z"),
      },
      {
        quizId: quizzes[0].id,
        userId: users[11].id,
        answers: createAnswersArray(quizzes[0].id, {
          "1": "8",
          "2": "21",
          "3": "6",
        }),
        score: 0.67,
        completedAt: new Date("2025-01-15T10:35:00Z"),
      },
      {
        quizId: quizzes[1].id,
        userId: users[12].id,
        answers: createAnswersArray(quizzes[1].id, {
          "1": "Water",
          "2": "It becomes water",
          "3": "Air",
        }),
        score: 1.0,
        completedAt: new Date("2025-01-18T09:15:00Z"),
      },
      {
        quizId: quizzes[2].id,
        userId: users[11].id,
        answers: createAnswersArray(quizzes[2].id, {
          "1": "The first paragraph",
          "2": "Facts that support the main idea",
        }),
        score: 1.0,
        completedAt: new Date("2025-01-20T14:20:00Z"),
      },
      {
        quizId: quizzes[3].id,
        userId: users[13].id,
        answers: createAnswersArray(quizzes[3].id, {
          "1": "Egyptians",
          "2": "The wheel",
          "3": "Greece",
        }),
        score: 1.0,
        completedAt: new Date("2025-01-22T11:30:00Z"),
      },
    ];

    await Promise.all(
      responses.map((response) =>
        prisma.response.create({
          data: response,
        })
      )
    );

    console.log("✅ Database seeded successfully!");
    console.log("\n📈 Summary:");
    console.log(`- ${users.length} users created`);
    console.log(`- ${organizations.length} campuses created`);
    console.log(`- ${memberships.length} campus memberships created`);
    console.log(`- ${quizzes.length} assessments created`);
    console.log(
      `- ${questionSets.reduce((acc, set) => acc + set.questions.length, 0)} questions created`
    );
    console.log(`- ${responses.length} student responses created`);
    console.log(
      `\n🔑 System Admin: superadmin@${fromEmailDomain} (password: ${devPassword})`
    );
    console.log(`\n👨‍💼 Campus Administrators:`);
    console.log(`- Lagos Campus: lagos.admin@${fromEmailDomain}`);
    console.log(`- Abuja Campus: abuja.admin@${fromEmailDomain}`);
    console.log(`\n👨‍🏫 Teachers:`);
    console.log(`- Mathematics: sarah.mathematics@${fromEmailDomain}`);
    console.log(`- Science: james.science@${fromEmailDomain}`);
    console.log(`- English: emily.english@${fromEmailDomain}`);
    console.log(`- History: michael.history@${fromEmailDomain}`);
    console.log(`\n👨‍👩‍👧 Parents:`);
    console.log(`- david.parent@${fromEmailDomain} (parent of Sophia)`);
    console.log(`- mary.parent@${fromEmailDomain} (parent of Oliver)`);
    console.log(`- john.parent@${fromEmailDomain} (parent of Emma)`);
    console.log(`\n👧👦 Students:`);
    console.log(`- sophia.student@${fromEmailDomain}`);
    console.log(`- oliver.student@${fromEmailDomain}`);
    console.log(`- emma.student@${fromEmailDomain}`);
    console.log(`- liam.student@${fromEmailDomain}`);
    console.log(`- ava.student@${fromEmailDomain}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
