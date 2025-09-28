import { PrismaClient } from "@prisma/client";
import { auth } from "../lib/auth";

const prisma = new PrismaClient();

async function seed() {
  const fromEmailDomain = process.env.NEXT_PUBLIC_TEST_USER_EMAIL_DOMAIN;

  if (!fromEmailDomain) {
    console.error(
      "NEXT_PUBLIC_TEST_USER_EMAIL_DOMAIN environment variable is required"
    );
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

    console.log("👥 Creating users...");

    const usersData = [
      {
        email: `superadmin@${fromEmailDomain}`,
        name: "System Super Admin",
        role: "super-admin",
      },
      {
        email: `org1owner1@${fromEmailDomain}`,
        name: "TechCorp Owner",
      },
      {
        email: `org1admin1@${fromEmailDomain}`,
        name: "TechCorp Admin One",
      },
      {
        email: `org1admin2@${fromEmailDomain}`,
        name: "TechCorp Admin Two",
      },
      {
        email: `org1member1@${fromEmailDomain}`,
        name: "TechCorp Member One",
      },
      {
        email: `org1member2@${fromEmailDomain}`,
        name: "TechCorp Member Two",
      },
      {
        email: `org2owner1@${fromEmailDomain}`,
        name: "EduSoft Owner",
      },
      {
        email: `org2admin1@${fromEmailDomain}`,
        name: "EduSoft Admin",
      },
      {
        email: `org2member1@${fromEmailDomain}`,
        name: "EduSoft Member One",
      },
      {
        email: `org2member2@${fromEmailDomain}`,
        name: "EduSoft Member Two",
      },
      {
        email: `org3owner1@${fromEmailDomain}`,
        name: "DevSkills Owner",
      },
      {
        email: `org3admin1@${fromEmailDomain}`,
        name: "DevSkills Admin",
      },
      {
        email: `org3member1@${fromEmailDomain}`,
        name: "DevSkills Member",
      },
    ];

    const users = [];
    for (const userData of usersData) {
      console.log(`Creating user: ${userData.email}`);

      const signUpResult = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: "Password123!",
          name: userData.name,
        },
      });

      if (!signUpResult.user) {
        throw new Error(`Failed to create user: ${userData.email}`);
      }

      users.push(signUpResult.user);

      if (userData.role) {
        await prisma.user.update({
          where: { id: signUpResult.user.id },
          data: { role: userData.role },
        });
      }

      await prisma.user.update({
        where: { id: signUpResult.user.id },
        data: { emailVerified: true },
      });
    }

    console.log("🏢 Creating organizations...");
    const organizations = await Promise.all([
      prisma.organization.create({
        data: {
          name: "TechCorp Learning",
          slug: "techcorp-learning",
          metadata: {
            description: "Enterprise technology training solutions",
            industry: "Technology",
          },
        },
      }),
      prisma.organization.create({
        data: {
          name: "EduSoft Academy",
          slug: "edusoft-academy",
          metadata: {
            description: "Educational software development training",
            industry: "Software",
          },
        },
      }),
      prisma.organization.create({
        data: {
          name: "DevSkills Institute",
          slug: "devskills-institute",
          metadata: {
            description: "Advanced developer skills and security training",
            industry: "Education",
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
      {
        userId: users[0].id,
        organizationId: organizations[0].id,
        role: "owner",
      },
      {
        userId: users[1].id,
        organizationId: organizations[0].id,
        role: "owner",
      },
      {
        userId: users[2].id,
        organizationId: organizations[0].id,
        role: "admin",
      },
      {
        userId: users[3].id,
        organizationId: organizations[0].id,
        role: "admin",
      },
      {
        userId: users[4].id,
        organizationId: organizations[0].id,
        role: "member",
      },
      {
        userId: users[5].id,
        organizationId: organizations[0].id,
        role: "member",
      },
      {
        userId: users[6].id,
        organizationId: organizations[1].id,
        role: "owner",
      },
      {
        userId: users[7].id,
        organizationId: organizations[1].id,
        role: "admin",
      },
      {
        userId: users[8].id,
        organizationId: organizations[1].id,
        role: "member",
      },
      {
        userId: users[9].id,
        organizationId: organizations[1].id,
        role: "member",
      },
      {
        userId: users[2].id,
        organizationId: organizations[1].id,
        role: "admin",
      },
      {
        userId: users[10].id,
        organizationId: organizations[2].id,
        role: "owner",
      },
      {
        userId: users[11].id,
        organizationId: organizations[2].id,
        role: "admin",
      },
      {
        userId: users[12].id,
        organizationId: organizations[2].id,
        role: "member",
      },
      {
        userId: users[4].id,
        organizationId: organizations[2].id,
        role: "member",
      },
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
          title: "JavaScript Fundamentals",
          description:
            "Test your knowledge of JavaScript basics including variables, functions, and control structures.",
          organizationId: organizations[0].id,
          createdBy: users[2].id,
          isActive: true,
        },
      }),
      prisma.quiz.create({
        data: {
          title: "React Components & Hooks",
          description:
            "Advanced React concepts including components, hooks, and state management.",
          organizationId: organizations[0].id,
          createdBy: users[3].id,
          isActive: true,
        },
      }),
      prisma.quiz.create({
        data: {
          title: "Database Design Principles",
          description:
            "Fundamental concepts of relational database design and normalization.",
          organizationId: organizations[1].id,
          createdBy: users[7].id,
          isActive: true,
        },
      }),
      prisma.quiz.create({
        data: {
          title: "Project Management Essentials",
          description:
            "Core project management methodologies and best practices.",
          organizationId: organizations[1].id,
          createdBy: users[2].id,
          isActive: false,
        },
      }),
      prisma.quiz.create({
        data: {
          title: "Web Security Fundamentals",
          description:
            "Essential web security concepts and common vulnerabilities.",
          organizationId: organizations[2].id,
          createdBy: users[11].id,
          isActive: true,
        },
      }),
      prisma.quiz.create({
        data: {
          title: "API Design Best Practices",
          description:
            "RESTful API design principles and implementation strategies.",
          organizationId: organizations[2].id,
          createdBy: users[11].id,
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
            question:
              "What is the correct way to declare a variable in JavaScript?",
            options: [
              "var myVar = 5;",
              "variable myVar = 5;",
              "v myVar = 5;",
              "declare myVar = 5;",
            ],
            correctAnswer: "var myVar = 5;",
            order: 1,
          },
          {
            question:
              "Which method is used to add an element to the end of an array?",
            options: ["append()", "push()", "add()", "insert()"],
            correctAnswer: "push()",
            order: 2,
          },
          {
            question: "What does '===' operator check in JavaScript?",
            options: [
              "Value only",
              "Type only",
              "Both value and type",
              "Neither value nor type",
            ],
            correctAnswer: "Both value and type",
            order: 3,
          },
          {
            question: "How do you create a function in JavaScript?",
            options: [
              "function myFunction() {}",
              "create myFunction() {}",
              "def myFunction() {}",
              "func myFunction() {}",
            ],
            correctAnswer: "function myFunction() {}",
            order: 4,
          },
        ],
      },
      {
        quizId: quizzes[1].id,
        questions: [
          {
            question: "What is the purpose of useEffect hook in React?",
            options: [
              "To manage state",
              "To handle side effects",
              "To create components",
              "To style elements",
            ],
            correctAnswer: "To handle side effects",
            order: 1,
          },
          {
            question:
              "How do you pass data from parent to child component in React?",
            options: [
              "Through props",
              "Through state",
              "Through context",
              "Through refs",
            ],
            correctAnswer: "Through props",
            order: 2,
          },
          {
            question: "What is JSX in React?",
            options: [
              "A programming language",
              "A syntax extension",
              "A library",
              "A framework",
            ],
            correctAnswer: "A syntax extension",
            order: 3,
          },
        ],
      },
      {
        quizId: quizzes[2].id,
        questions: [
          {
            question: "What is a primary key in a database?",
            options: [
              "A unique identifier for records",
              "The first column",
              "A password",
              "A table name",
            ],
            correctAnswer: "A unique identifier for records",
            order: 1,
          },
          {
            question: "What is database normalization?",
            options: [
              "Making data normal",
              "Organizing data efficiently",
              "Backing up data",
              "Encrypting data",
            ],
            correctAnswer: "Organizing data efficiently",
            order: 2,
          },
          {
            question: "What does ACID stand for in database systems?",
            options: [
              "Atomicity, Consistency, Isolation, Durability",
              "Access, Create, Insert, Delete",
              "All, Column, Index, Data",
              "Auto, Cache, Identity, Default",
            ],
            correctAnswer: "Atomicity, Consistency, Isolation, Durability",
            order: 3,
          },
        ],
      },
      {
        quizId: quizzes[3].id,
        questions: [
          {
            question: "What is the first phase of project management?",
            options: ["Execution", "Planning", "Initiation", "Monitoring"],
            correctAnswer: "Initiation",
            order: 1,
          },
          {
            question: "What is a Gantt chart used for?",
            options: [
              "Budget tracking",
              "Task scheduling",
              "Team communication",
              "Risk assessment",
            ],
            correctAnswer: "Task scheduling",
            order: 2,
          },
          {
            question: "What does MVP stand for in project management?",
            options: [
              "Most Valuable Player",
              "Minimum Viable Product",
              "Maximum Value Proposition",
              "Master Verification Process",
            ],
            correctAnswer: "Minimum Viable Product",
            order: 3,
          },
        ],
      },
      {
        quizId: quizzes[4].id,
        questions: [
          {
            question: "What does XSS stand for?",
            options: [
              "Cross-Site Scripting",
              "Extended Security System",
              "XML Security Standard",
              "External Script Source",
            ],
            correctAnswer: "Cross-Site Scripting",
            order: 1,
          },
          {
            question: "What is SQL injection?",
            options: [
              "A database feature",
              "A security vulnerability",
              "A query optimization",
              "A backup method",
            ],
            correctAnswer: "A security vulnerability",
            order: 2,
          },
          {
            question: "What is HTTPS?",
            options: [
              "HTTP Secure",
              "Hypertext Transfer Protocol Secure",
              "High-Performance Transfer Protocol",
              "Host Transfer Protocol System",
            ],
            correctAnswer: "Hypertext Transfer Protocol Secure",
            order: 3,
          },
        ],
      },
      {
        quizId: quizzes[5].id,
        questions: [
          {
            question: "What does REST stand for?",
            options: [
              "Representational State Transfer",
              "Remote Execution Service Technology",
              "Reliable Secure Transfer",
              "Resource Exchange Standard Transfer",
            ],
            correctAnswer: "Representational State Transfer",
            order: 1,
          },
          {
            question: "Which HTTP method is used to update a resource?",
            options: ["GET", "POST", "PUT", "DELETE"],
            correctAnswer: "PUT",
            order: 2,
          },
          {
            question: "What is the purpose of API versioning?",
            options: [
              "To track changes",
              "To maintain backward compatibility",
              "To improve performance",
              "To reduce costs",
            ],
            correctAnswer: "To maintain backward compatibility",
            order: 3,
          },
        ],
      },
    ];

    for (const questionSet of questionSets) {
      await Promise.all(
        questionSet.questions.map((question) =>
          prisma.question.create({
            data: {
              ...question,
              quizId: questionSet.quizId,
            },
          })
        )
      );
    }

    console.log("📊 Creating quiz responses...");
    const responses = [
      {
        quizId: quizzes[0].id,
        userId: users[4].id,
        answers: {
          "1": "var myVar = 5;",
          "2": "push()",
          "3": "Both value and type",
          "4": "function myFunction() {}",
        },
        score: 100,
        completedAt: new Date("2024-01-15T10:30:00Z"),
      },
      {
        quizId: quizzes[0].id,
        userId: users[5].id,
        answers: {
          "1": "var myVar = 5;",
          "2": "add()",
          "3": "Both value and type",
          "4": "function myFunction() {}",
        },
        score: 75,
        completedAt: new Date("2024-01-16T14:20:00Z"),
      },
      {
        quizId: quizzes[1].id,
        userId: users[4].id,
        answers: {
          "1": "To handle side effects",
          "2": "Through props",
          "3": "A syntax extension",
        },
        score: 100,
        completedAt: new Date("2024-01-20T09:15:00Z"),
      },
      {
        quizId: quizzes[1].id,
        userId: users[5].id,
        answers: {
          "1": "To manage state",
          "2": "Through props",
          "3": "A syntax extension",
        },
        score: 67,
        completedAt: new Date("2024-01-21T16:45:00Z"),
      },
      {
        quizId: quizzes[2].id,
        userId: users[8].id,
        answers: {
          "1": "A unique identifier for records",
          "2": "Organizing data efficiently",
          "3": "Atomicity, Consistency, Isolation, Durability",
        },
        score: 100,
        completedAt: new Date("2024-01-25T11:30:00Z"),
      },
      {
        quizId: quizzes[3].id,
        userId: users[9].id,
        answers: {
          "1": "Initiation",
          "2": "Task scheduling",
          "3": "Minimum Viable Product",
        },
        score: 100,
        completedAt: new Date("2024-02-01T08:20:00Z"),
      },
      {
        quizId: quizzes[4].id,
        userId: users[12].id,
        answers: {
          "1": "Cross-Site Scripting",
          "2": "A security vulnerability",
          "3": "HTTP Secure",
        },
        score: 67,
        completedAt: new Date("2024-02-05T13:10:00Z"),
      },
      {
        quizId: quizzes[5].id,
        userId: users[4].id,
        answers: {
          "1": "Representational State Transfer",
          "2": "PUT",
          "3": "To maintain backward compatibility",
        },
        score: 100,
        completedAt: new Date("2024-02-10T15:45:00Z"),
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
    console.log(`🔑 TechCorp Owner: org1owner1@${fromEmailDomain}`);
    console.log(`🔑 EduSoft Owner: org2owner1@${fromEmailDomain}`);
    console.log(`🔑 DevSkills Owner: org3owner1@${fromEmailDomain}`);
    console.log(`\n🔗 Cross-org memberships:`);
    console.log(
      `- org1admin1@${fromEmailDomain} (admin in TechCorp & EduSoft)`
    );
    console.log(
      `- org1member1@${fromEmailDomain} (member in TechCorp & DevSkills)`
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
