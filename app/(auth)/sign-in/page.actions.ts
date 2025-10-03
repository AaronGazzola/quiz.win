"use server";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getPasswordLengthAction() {
  try {
    const password = await prisma.password.findFirst({
      select: { length: true },
    });

    return {
      data: password?.length || null,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch password length"
    };
  }
}

export async function verifyPasswordAction(inputPassword: string) {
  try {
    const bcrypt = await import("bcryptjs");

    const password = await prisma.password.findFirst({
      select: { hash: true },
    });

    if (!password) {
      return {
        data: false,
        error: "Password not configured"
      };
    }

    const isValid = await bcrypt.compare(inputPassword, password.hash);

    return {
      data: isValid,
      error: null
    };
  } catch (error) {
    return {
      data: false,
      error: error instanceof Error ? error.message : "Failed to verify password"
    };
  }
}

export async function getAllUsersAction() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
      },
      orderBy: [
        { role: "desc" },
        { name: "asc" },
      ],
    });

    return {
      data: users,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch users"
    };
  }
}
