import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function assignAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error("Please provide an email address");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: "super-admin" },
    });

  } catch (error) {
    console.error("❌ Error assigning admin role:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

assignAdmin();