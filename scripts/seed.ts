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
    await prisma.grade.deleteMany();
    await prisma.attendanceRecord.deleteMany();
    await prisma.attendanceSession.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.message.deleteMany();
    await prisma.response.deleteMany();
    await prisma.question.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.classroomEnrollment.deleteMany();
    await prisma.classroom.deleteMany();
    await prisma.studentParent.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.student.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.member.deleteMany();
    await prisma.campus.deleteMany();
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
      prisma.campus.create({
        data: {
          name: "Abraham Lincoln Academy - Lagos Campus",
          slug: "alaa-lagos",
          address: "123 Victoria Island Road, Lagos, Nigeria",
          phone: "+234-1-234-5678",
          principalName: "Dr. Adebayo Okonkwo",
          capacity: 500,
          location: "Victoria Island, Lagos",
          metadata: {
            description: "Premier American-curriculum school in Lagos, Nigeria",
          },
        },
      }),
      prisma.campus.create({
        data: {
          name: "Abraham Lincoln Academy - Abuja Campus",
          slug: "alaa-abuja",
          address: "456 Maitama District, Abuja, Nigeria",
          phone: "+234-9-876-5432",
          principalName: "Mrs. Chimamanda Nwosu",
          capacity: 400,
          location: "Maitama District, Abuja",
          metadata: {
            description: "Premier American-curriculum school in Abuja, Nigeria",
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
      prisma.assessment.create({
        data: {
          title: "Grade 3 Mathematics - Week 1",
          description: "Basic arithmetic and number recognition assessment",
          subject: "Mathematics",
          gradeLevel: "Grade 3",
          organizationId: organizations[0].id,
          createdBy: users[3].id,
          isActive: true,
        },
      }),
      prisma.assessment.create({
        data: {
          title: "Grade 4 Science - States of Matter",
          description: "Understanding solids, liquids, and gases",
          subject: "Science",
          gradeLevel: "Grade 4",
          organizationId: organizations[0].id,
          createdBy: users[4].id,
          isActive: true,
        },
      }),
      prisma.assessment.create({
        data: {
          title: "Grade 5 English - Reading Comprehension",
          description: "Understanding main ideas and supporting details",
          subject: "English",
          gradeLevel: "Grade 5",
          organizationId: organizations[0].id,
          createdBy: users[5].id,
          isActive: true,
        },
      }),
      prisma.assessment.create({
        data: {
          title: "Grade 6 History - Ancient Civilizations",
          description: "Early civilizations and their contributions",
          subject: "History",
          gradeLevel: "Grade 6",
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

    console.log("👩‍🏫 Creating teacher profiles...");
    const teachers = await Promise.all([
      prisma.teacher.create({
        data: {
          userId: users[3].id,
          campusId: organizations[0].id,
          subjects: ["Mathematics", "Algebra"],
          certifications: ["State Teaching Certificate", "Mathematics Specialist"],
          employeeId: "TCH001",
        },
      }),
      prisma.teacher.create({
        data: {
          userId: users[4].id,
          campusId: organizations[0].id,
          subjects: ["Science", "Physics"],
          certifications: ["State Teaching Certificate", "Science Education"],
          employeeId: "TCH002",
        },
      }),
      prisma.teacher.create({
        data: {
          userId: users[5].id,
          campusId: organizations[0].id,
          subjects: ["English", "Literature"],
          certifications: ["State Teaching Certificate", "English Language Arts"],
          employeeId: "TCH003",
        },
      }),
      prisma.teacher.create({
        data: {
          userId: users[6].id,
          campusId: organizations[1].id,
          subjects: ["History", "Social Studies"],
          certifications: ["State Teaching Certificate", "History Education"],
          employeeId: "TCH004",
        },
      }),
    ]);

    console.log("👨‍👩‍👧 Creating parent profiles...");
    const parents = await Promise.all([
      prisma.parent.create({
        data: {
          userId: users[7].id,
          relationship: "Father",
          primaryContact: true,
          occupation: "Engineer",
        },
      }),
      prisma.parent.create({
        data: {
          userId: users[8].id,
          relationship: "Mother",
          primaryContact: true,
          occupation: "Doctor",
        },
      }),
      prisma.parent.create({
        data: {
          userId: users[9].id,
          relationship: "Father",
          primaryContact: true,
          occupation: "Lawyer",
        },
      }),
    ]);

    console.log("👧👦 Creating student profiles...");
    const students = await Promise.all([
      prisma.student.create({
        data: {
          userId: users[10].id,
          grade: "Grade 3",
          campusId: organizations[0].id,
          medicalInfo: {
            allergies: [],
            conditions: [],
            medications: [],
          },
        },
      }),
      prisma.student.create({
        data: {
          userId: users[11].id,
          grade: "Grade 4",
          campusId: organizations[0].id,
          medicalInfo: {
            allergies: ["Peanuts"],
            conditions: [],
            medications: [],
          },
        },
      }),
      prisma.student.create({
        data: {
          userId: users[12].id,
          grade: "Grade 5",
          campusId: organizations[0].id,
          medicalInfo: {
            allergies: [],
            conditions: [],
            medications: [],
          },
        },
      }),
      prisma.student.create({
        data: {
          userId: users[13].id,
          grade: "Grade 6",
          campusId: organizations[1].id,
          medicalInfo: {
            allergies: [],
            conditions: [],
            medications: [],
          },
        },
      }),
      prisma.student.create({
        data: {
          userId: users[14].id,
          grade: "Grade 6",
          campusId: organizations[1].id,
          medicalInfo: {
            allergies: [],
            conditions: ["Asthma"],
            medications: ["Inhaler as needed"],
          },
        },
      }),
    ]);

    console.log("👨‍👩‍👦 Creating student-parent relationships...");
    await Promise.all([
      prisma.studentParent.create({
        data: {
          studentId: students[0].id,
          parentId: parents[0].id,
        },
      }),
      prisma.studentParent.create({
        data: {
          studentId: students[1].id,
          parentId: parents[1].id,
        },
      }),
      prisma.studentParent.create({
        data: {
          studentId: students[2].id,
          parentId: parents[2].id,
        },
      }),
    ]);

    console.log("🏫 Creating classrooms...");
    const classrooms = await Promise.all([
      prisma.classroom.create({
        data: {
          name: "Grade 3 Mathematics A",
          grade: "Grade 3",
          subject: "Mathematics",
          campusId: organizations[0].id,
          teacherId: teachers[0].id,
          capacity: 25,
          room: "Room 101",
        },
      }),
      prisma.classroom.create({
        data: {
          name: "Grade 4 Science B",
          grade: "Grade 4",
          subject: "Science",
          campusId: organizations[0].id,
          teacherId: teachers[1].id,
          capacity: 25,
          room: "Room 205",
        },
      }),
      prisma.classroom.create({
        data: {
          name: "Grade 5 English A",
          grade: "Grade 5",
          subject: "English",
          campusId: organizations[0].id,
          teacherId: teachers[2].id,
          capacity: 25,
          room: "Room 303",
        },
      }),
      prisma.classroom.create({
        data: {
          name: "Grade 6 History A",
          grade: "Grade 6",
          subject: "History",
          campusId: organizations[1].id,
          teacherId: teachers[3].id,
          capacity: 30,
          room: "Room 202",
        },
      }),
    ]);

    console.log("📚 Creating classroom enrollments...");
    await Promise.all([
      prisma.classroomEnrollment.create({
        data: {
          classroomId: classrooms[0].id,
          studentId: students[0].id,
        },
      }),
      prisma.classroomEnrollment.create({
        data: {
          classroomId: classrooms[1].id,
          studentId: students[1].id,
        },
      }),
      prisma.classroomEnrollment.create({
        data: {
          classroomId: classrooms[2].id,
          studentId: students[2].id,
        },
      }),
      prisma.classroomEnrollment.create({
        data: {
          classroomId: classrooms[3].id,
          studentId: students[3].id,
        },
      }),
      prisma.classroomEnrollment.create({
        data: {
          classroomId: classrooms[3].id,
          studentId: students[4].id,
        },
      }),
    ]);

    console.log("📅 Creating attendance sessions...");
    const attendanceSessions = await Promise.all([
      prisma.attendanceSession.create({
        data: {
          classroomId: classrooms[0].id,
          date: new Date("2025-03-01T08:00:00Z"),
          campusId: organizations[0].id,
          markedById: teachers[0].userId,
        },
      }),
      prisma.attendanceSession.create({
        data: {
          classroomId: classrooms[1].id,
          date: new Date("2025-03-01T08:00:00Z"),
          campusId: organizations[0].id,
          markedById: teachers[1].userId,
        },
      }),
      prisma.attendanceSession.create({
        data: {
          classroomId: classrooms[2].id,
          date: new Date("2025-03-01T08:00:00Z"),
          campusId: organizations[0].id,
          markedById: teachers[2].userId,
        },
      }),
    ]);

    console.log("✅ Creating attendance records...");
    await Promise.all([
      prisma.attendanceRecord.create({
        data: {
          sessionId: attendanceSessions[0].id,
          studentId: students[0].id,
          status: "Present",
        },
      }),
      prisma.attendanceRecord.create({
        data: {
          sessionId: attendanceSessions[1].id,
          studentId: students[1].id,
          status: "Present",
        },
      }),
      prisma.attendanceRecord.create({
        data: {
          sessionId: attendanceSessions[2].id,
          studentId: students[2].id,
          status: "Late",
          notes: "Arrived 10 minutes late",
        },
      }),
    ]);

    console.log("📝 Creating grades...");
    const grades = await Promise.all([
      prisma.grade.create({
        data: {
          studentId: students[0].id,
          classroomId: classrooms[0].id,
          subject: "Mathematics",
          grade: "A",
          gradingPeriod: "Quarter 1",
          teacherId: teachers[0].id,
          campusId: organizations[0].id,
          comments: "Excellent work on all assignments",
        },
      }),
      prisma.grade.create({
        data: {
          studentId: students[1].id,
          classroomId: classrooms[1].id,
          subject: "Science",
          grade: "B+",
          gradingPeriod: "Quarter 1",
          teacherId: teachers[1].id,
          campusId: organizations[0].id,
          comments: "Good understanding of concepts",
        },
      }),
      prisma.grade.create({
        data: {
          studentId: students[2].id,
          classroomId: classrooms[2].id,
          subject: "English",
          grade: "A-",
          gradingPeriod: "Quarter 1",
          teacherId: teachers[2].id,
          campusId: organizations[0].id,
          comments: "Strong reading comprehension skills",
        },
      }),
      prisma.grade.create({
        data: {
          studentId: students[3].id,
          classroomId: classrooms[3].id,
          subject: "History",
          grade: "B",
          gradingPeriod: "Quarter 1",
          teacherId: teachers[3].id,
          campusId: organizations[1].id,
          comments: "Shows good interest in historical topics",
        },
      }),
    ]);

    console.log("📨 Creating sample messages...");

    const messages = [
      {
        senderId: users[7].id,
        recipientId: users[3].id,
        subject: "Question about homework",
        content: "Hi Mrs. Johnson, could you please clarify the homework assignment for this week?",
        conversationId: [users[7].id, users[3].id].sort().join("-"),
        campusId: organizations[0].id,
        isRead: true,
      },
      {
        senderId: users[3].id,
        recipientId: users[7].id,
        subject: "Re: Question about homework",
        content: "Hello David, the homework is on pages 45-47 in the textbook. Students should complete exercises 1-10.",
        conversationId: [users[7].id, users[3].id].sort().join("-"),
        campusId: organizations[0].id,
        isRead: false,
      },
      {
        senderId: users[8].id,
        recipientId: users[4].id,
        subject: "Parent-Teacher Conference",
        content: "Dear Mr. Anderson, I would like to schedule a meeting to discuss Oliver's progress in science.",
        conversationId: [users[8].id, users[4].id].sort().join("-"),
        campusId: organizations[0].id,
        isRead: true,
      },
    ];

    await Promise.all(
      messages.map((message) =>
        prisma.message.create({
          data: message,
        })
      )
    );

    console.log("📢 Creating sample announcements...");

    const announcements = [
      {
        title: "Parent-Teacher Conference Week",
        content: "Parent-teacher conferences will be held next week from March 10-14. Please check your email for your scheduled time slot.",
        authorId: users[1].id,
        campusId: organizations[0].id,
        targetAudience: "AllParents",
        isPinned: true,
        publishedAt: new Date("2025-03-01T08:00:00Z"),
      },
      {
        title: "Science Fair Reminder",
        content: "The annual science fair is coming up on March 25th. All students should have their projects ready by March 20th for preliminary review.",
        authorId: users[4].id,
        campusId: organizations[0].id,
        targetAudience: "AllParents",
        isPinned: false,
        publishedAt: new Date("2025-03-03T09:00:00Z"),
      },
      {
        title: "Staff Meeting - Professional Development",
        content: "All teachers are invited to attend the professional development session on Friday at 3:00 PM in the conference room. Topic: Integrating Technology in the Classroom.",
        authorId: users[1].id,
        campusId: organizations[0].id,
        targetAudience: "AllTeachers",
        isPinned: false,
        publishedAt: new Date("2025-03-04T10:00:00Z"),
      },
      {
        title: "Grade 5 Field Trip Permission Slips Due",
        content: "Grade 5 parents: Permission slips for the museum field trip are due by March 15th. Please sign and return them with your child.",
        authorId: users[5].id,
        campusId: organizations[0].id,
        targetAudience: "Grade",
        grade: "Grade 5",
        isPinned: false,
        publishedAt: new Date("2025-03-05T11:00:00Z"),
      },
    ];

    await Promise.all(
      announcements.map((announcement) =>
        prisma.announcement.create({
          data: announcement,
        })
      )
    );

    console.log("✅ Database seeded successfully!");
    console.log("\n📈 Summary:");
    console.log(`- ${users.length} users created`);
    console.log(`- ${organizations.length} campuses created`);
    console.log(`- ${memberships.length} campus memberships created`);
    console.log(`- ${teachers.length} teacher profiles created`);
    console.log(`- ${students.length} student profiles created`);
    console.log(`- ${parents.length} parent profiles created`);
    console.log(`- ${classrooms.length} classrooms created`);
    console.log(`- ${quizzes.length} assessments created`);
    console.log(
      `- ${questionSets.reduce((acc, set) => acc + set.questions.length, 0)} questions created`
    );
    console.log(`- ${responses.length} student responses created`);
    console.log(`- ${attendanceSessions.length} attendance sessions created`);
    console.log(`- ${grades.length} grades created`);
    console.log(`- ${messages.length} messages created`);
    console.log(`- ${announcements.length} announcements created`);
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
