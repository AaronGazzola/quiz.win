import { PrismaClient } from "@prisma/client";
import { auth } from "./auth";
import { headers } from "next/headers";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const getAuthenticatedClient = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    db: prisma,
    user: session?.user || null,
    session: session || null,
  };
};