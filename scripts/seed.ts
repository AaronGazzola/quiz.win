import { PrismaClient } from "@prisma/client";
import { auth } from "../lib/auth";
import bcrypt from "bcryptjs";
import "better-auth/node";

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
    await prisma.password.deleteMany();
    await prisma.magicLink.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    console.log("🔐 Creating password hash...");
    const passwordHash = await bcrypt.hash(devPassword, 10);

    await prisma.password.create({
      data: {
        length: devPassword.length,
        hash: passwordHash,
      },
    });

    console.log("👥 Creating users...");

    const usersData = [
      {
        email: `superadmin@${fromEmailDomain}`,
        name: "System Administrator",
        role: "super-admin",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      },
      {
        email: `dr.sarah.chen@${fromEmailDomain}`,
        name: "Dr. Sarah Chen",
        role: "owner",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      },
      {
        email: `dr.james.wilson@${fromEmailDomain}`,
        name: "Dr. James Wilson",
        role: "admin",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
      },
      {
        email: `nurse.emily.davis@${fromEmailDomain}`,
        name: "Emily Davis, RN",
        role: "member",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
      },
      {
        email: `admin.michael.brown@${fromEmailDomain}`,
        name: "Michael Brown",
        role: "member",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      },
      {
        email: `john.smith@${fromEmailDomain}`,
        name: "John Smith",
        role: "owner",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      },
      {
        email: `lisa.anderson@${fromEmailDomain}`,
        name: "Lisa Anderson",
        role: "admin",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
      },
      {
        email: `david.martinez@${fromEmailDomain}`,
        name: "David Martinez",
        role: "member",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
      },
      {
        email: `jennifer.taylor@${fromEmailDomain}`,
        name: "Jennifer Taylor",
        role: "member",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer",
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

      if (userData.role && userData.role !== "member") {
        await prisma.user.update({
          where: { id: result.user.id },
          data: { role: userData.role },
        });
      }

      await prisma.user.update({
        where: { id: result.user.id },
        data: {
          emailVerified: true,
          image: userData.image,
        },
      });
    }

    console.log("🏢 Creating organizations...");
    const organizations = await Promise.all([
      prisma.organization.create({
        data: {
          name: "HealthCare Partners",
          slug: "healthcare-partners",
          metadata: {
            description: "Comprehensive medical training and patient care excellence",
            industry: "Healthcare",
            focus: "Medical Training",
          },
        },
      }),
      prisma.organization.create({
        data: {
          name: "TechCorp Solutions",
          slug: "techcorp-solutions",
          metadata: {
            description: "Enterprise technology training and software development",
            industry: "Technology",
            focus: "Corporate Training",
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

    console.log("🤝 Creating organization memberships...");
    const memberships = [
      { userId: users[1].id, organizationId: organizations[0].id, role: "owner" },
      { userId: users[2].id, organizationId: organizations[0].id, role: "admin" },
      { userId: users[3].id, organizationId: organizations[0].id, role: "member" },
      { userId: users[4].id, organizationId: organizations[0].id, role: "member" },
      { userId: users[5].id, organizationId: organizations[1].id, role: "owner" },
      { userId: users[6].id, organizationId: organizations[1].id, role: "admin" },
      { userId: users[7].id, organizationId: organizations[1].id, role: "member" },
      { userId: users[8].id, organizationId: organizations[1].id, role: "member" },
    ];

    await Promise.all(
      memberships.map((membership) =>
        prisma.member.create({
          data: membership,
        })
      )
    );

    console.log("📝 Creating quizzes...");
    const quizzes = await Promise.all([
      prisma.quiz.create({
        data: {
          title: "Patient Safety Protocols",
          description:
            "Essential patient safety procedures and best practices for healthcare professionals.",
          organizationId: organizations[0].id,
          createdBy: users[1].id,
          isActive: true,
        },
      }),
      prisma.quiz.create({
        data: {
          title: "HIPAA Compliance Fundamentals",
          description:
            "Understanding HIPAA regulations and protecting patient privacy.",
          organizationId: organizations[0].id,
          createdBy: users[2].id,
          isActive: true,
        },
      }),
      prisma.quiz.create({
        data: {
          title: "Medical Terminology Basics",
          description:
            "Foundation of medical terminology for healthcare staff.",
          organizationId: organizations[0].id,
          createdBy: users[2].id,
          isActive: false,
        },
      }),
      prisma.quiz.create({
        data: {
          title: "Cybersecurity Best Practices",
          description:
            "Essential cybersecurity principles for protecting corporate data and systems.",
          organizationId: organizations[1].id,
          createdBy: users[5].id,
          isActive: true,
        },
      }),
      prisma.quiz.create({
        data: {
          title: "Agile Project Management",
          description:
            "Agile methodologies and best practices for modern project management.",
          organizationId: organizations[1].id,
          createdBy: users[6].id,
          isActive: true,
        },
      }),
      prisma.quiz.create({
        data: {
          title: "Software Development Lifecycle",
          description:
            "Understanding SDLC phases and best practices for software development.",
          organizationId: organizations[1].id,
          createdBy: users[6].id,
          isActive: false,
        },
      }),
    ]);

    console.log("❓ Creating questions...");
    const questionSets = [
      {
        quizId: quizzes[0].id,
        questions: [
          {
            question: "What is the first step in patient identification?",
            options: [
              "Check the patient wristband with two identifiers",
              "Ask the patient their name",
              "Look at the room number",
              "Check the medical chart",
            ],
            correctAnswer: "Check the patient wristband with two identifiers",
            order: 1,
          },
          {
            question: "How often should hand hygiene be performed?",
            options: [
              "Once per shift",
              "Before and after patient contact",
              "Only when hands are visibly dirty",
              "Once per hour",
            ],
            correctAnswer: "Before and after patient contact",
            order: 2,
          },
          {
            question: "What should you do if you witness a medication error?",
            options: [
              "Ignore it if the patient seems fine",
              "Report it immediately to the supervising physician",
              "Document it at the end of shift",
              "Tell a colleague",
            ],
            correctAnswer: "Report it immediately to the supervising physician",
            order: 3,
          },
          {
            question: "When should fall risk assessments be conducted?",
            options: [
              "Only on admission",
              "On admission and with any change in condition",
              "Once per week",
              "Only for elderly patients",
            ],
            correctAnswer: "On admission and with any change in condition",
            order: 4,
          },
        ],
      },
      {
        quizId: quizzes[1].id,
        questions: [
          {
            question: "What does HIPAA stand for?",
            options: [
              "Health Insurance Portability and Accountability Act",
              "Healthcare Information Privacy and Access Act",
              "Hospital Insurance Protection and Access Act",
              "Health Information Processing and Accountability Act",
            ],
            correctAnswer: "Health Insurance Portability and Accountability Act",
            order: 1,
          },
          {
            question: "What is Protected Health Information (PHI)?",
            options: [
              "Only social security numbers",
              "Any health information that can identify an individual",
              "Only medical diagnoses",
              "Only insurance information",
            ],
            correctAnswer: "Any health information that can identify an individual",
            order: 2,
          },
          {
            question: "When can PHI be disclosed without patient authorization?",
            options: [
              "For treatment, payment, and healthcare operations",
              "To any healthcare worker who asks",
              "To family members at any time",
              "Never without authorization",
            ],
            correctAnswer: "For treatment, payment, and healthcare operations",
            order: 3,
          },
        ],
      },
      {
        quizId: quizzes[2].id,
        questions: [
          {
            question: "What does the suffix '-itis' mean?",
            options: [
              "Inflammation",
              "Removal",
              "Study of",
              "Disease",
            ],
            correctAnswer: "Inflammation",
            order: 1,
          },
          {
            question: "What does 'brady-' mean as a prefix?",
            options: [
              "Fast",
              "Slow",
              "Above",
              "Below",
            ],
            correctAnswer: "Slow",
            order: 2,
          },
          {
            question: "What does 'cardio' refer to?",
            options: [
              "Heart",
              "Lungs",
              "Liver",
              "Brain",
            ],
            correctAnswer: "Heart",
            order: 3,
          },
        ],
      },
      {
        quizId: quizzes[3].id,
        questions: [
          {
            question: "What is the purpose of multi-factor authentication (MFA)?",
            options: [
              "To slow down the login process",
              "To add an extra layer of security beyond passwords",
              "To track user activity",
              "To replace passwords entirely",
            ],
            correctAnswer: "To add an extra layer of security beyond passwords",
            order: 1,
          },
          {
            question: "What is a phishing attack?",
            options: [
              "A type of virus",
              "An attempt to obtain sensitive information through deceptive emails",
              "A network scanning technique",
              "A password cracking method",
            ],
            correctAnswer: "An attempt to obtain sensitive information through deceptive emails",
            order: 2,
          },
          {
            question: "How often should you update your passwords?",
            options: [
              "Never",
              "Every 90 days or when compromised",
              "Every day",
              "Only when you forget them",
            ],
            correctAnswer: "Every 90 days or when compromised",
            order: 3,
          },
          {
            question: "What is the principle of least privilege?",
            options: [
              "Everyone should have admin access",
              "Users should only have access to resources needed for their job",
              "Managers should have all privileges",
              "No one should have any privileges",
            ],
            correctAnswer: "Users should only have access to resources needed for their job",
            order: 4,
          },
        ],
      },
      {
        quizId: quizzes[4].id,
        questions: [
          {
            question: "What is a sprint in Agile methodology?",
            options: [
              "A time-boxed iteration for completing work",
              "A type of meeting",
              "A project phase",
              "A development tool",
            ],
            correctAnswer: "A time-boxed iteration for completing work",
            order: 1,
          },
          {
            question: "What is the purpose of a daily standup?",
            options: [
              "To assign new tasks",
              "To sync the team on progress and blockers",
              "To review code",
              "To plan the sprint",
            ],
            correctAnswer: "To sync the team on progress and blockers",
            order: 2,
          },
          {
            question: "What does a Product Owner do in Agile?",
            options: [
              "Writes all the code",
              "Manages the product backlog and prioritizes work",
              "Leads daily standups",
              "Tests the software",
            ],
            correctAnswer: "Manages the product backlog and prioritizes work",
            order: 3,
          },
        ],
      },
      {
        quizId: quizzes[5].id,
        questions: [
          {
            question: "What is the first phase of the SDLC?",
            options: [
              "Implementation",
              "Planning",
              "Testing",
              "Maintenance",
            ],
            correctAnswer: "Planning",
            order: 1,
          },
          {
            question: "What happens during the testing phase?",
            options: [
              "Code is written",
              "Defects are identified and fixed",
              "Requirements are gathered",
              "Software is deployed",
            ],
            correctAnswer: "Defects are identified and fixed",
            order: 2,
          },
          {
            question: "What is continuous integration?",
            options: [
              "Writing code continuously",
              "Regularly merging code changes into a shared repository",
              "Testing only at the end",
              "Deploying every day",
            ],
            correctAnswer: "Regularly merging code changes into a shared repository",
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

    console.log("📊 Creating quiz responses...");

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
        userId: users[3].id,
        answers: createAnswersArray(quizzes[0].id, {
          "1": "Check the patient wristband with two identifiers",
          "2": "Before and after patient contact",
          "3": "Report it immediately to the supervising physician",
          "4": "On admission and with any change in condition",
        }),
        score: 1.0,
        completedAt: new Date("2024-01-15T10:30:00Z"),
      },
      {
        quizId: quizzes[0].id,
        userId: users[4].id,
        answers: createAnswersArray(quizzes[0].id, {
          "1": "Check the patient wristband with two identifiers",
          "2": "Once per hour",
          "3": "Report it immediately to the supervising physician",
          "4": "On admission and with any change in condition",
        }),
        score: 0.75,
        completedAt: new Date("2024-01-16T14:20:00Z"),
      },
      {
        quizId: quizzes[1].id,
        userId: users[3].id,
        answers: createAnswersArray(quizzes[1].id, {
          "1": "Health Insurance Portability and Accountability Act",
          "2": "Any health information that can identify an individual",
          "3": "For treatment, payment, and healthcare operations",
        }),
        score: 1.0,
        completedAt: new Date("2024-01-20T09:15:00Z"),
      },
      {
        quizId: quizzes[3].id,
        userId: users[7].id,
        answers: createAnswersArray(quizzes[3].id, {
          "1": "To add an extra layer of security beyond passwords",
          "2": "An attempt to obtain sensitive information through deceptive emails",
          "3": "Every 90 days or when compromised",
          "4": "Users should only have access to resources needed for their job",
        }),
        score: 1.0,
        completedAt: new Date("2024-01-25T11:30:00Z"),
      },
      {
        quizId: quizzes[3].id,
        userId: users[8].id,
        answers: createAnswersArray(quizzes[3].id, {
          "1": "To add an extra layer of security beyond passwords",
          "2": "A type of virus",
          "3": "Every 90 days or when compromised",
          "4": "Users should only have access to resources needed for their job",
        }),
        score: 0.75,
        completedAt: new Date("2024-01-26T15:45:00Z"),
      },
      {
        quizId: quizzes[4].id,
        userId: users[7].id,
        answers: createAnswersArray(quizzes[4].id, {
          "1": "A time-boxed iteration for completing work",
          "2": "To sync the team on progress and blockers",
          "3": "Manages the product backlog and prioritizes work",
        }),
        score: 1.0,
        completedAt: new Date("2024-02-01T08:20:00Z"),
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
    console.log(`- ${organizations.length} organizations created`);
    console.log(`- ${memberships.length} memberships created`);
    console.log(`- ${quizzes.length} quizzes created`);
    console.log(
      `- ${questionSets.reduce((acc, set) => acc + set.questions.length, 0)} questions created`
    );
    console.log(`- ${responses.length} responses created`);
    console.log(
      `\n🔑 System Admin: superadmin@${fromEmailDomain} (role: super-admin)`
    );
    console.log(`\n🏥 HealthCare Partners Users:`);
    console.log(`- dr.sarah.chen@${fromEmailDomain} (Owner)`);
    console.log(`- dr.james.wilson@${fromEmailDomain} (Admin)`);
    console.log(`- nurse.emily.davis@${fromEmailDomain} (Member)`);
    console.log(`- admin.michael.brown@${fromEmailDomain} (Member)`);
    console.log(`\n💼 TechCorp Solutions Users:`);
    console.log(`- john.smith@${fromEmailDomain} (Owner)`);
    console.log(`- lisa.anderson@${fromEmailDomain} (Admin)`);
    console.log(`- david.martinez@${fromEmailDomain} (Member)`);
    console.log(`- jennifer.taylor@${fromEmailDomain} (Member)`);
    console.log(`\n🔐 All users use DEV_PASSWORD: ${devPassword}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
