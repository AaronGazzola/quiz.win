-- CreateTable
CREATE TABLE "auth"."password" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_pkey" PRIMARY KEY ("id")
);
