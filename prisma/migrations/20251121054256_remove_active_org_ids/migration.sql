/*
  Warnings:

  - You are about to drop the column `activeOrganizationId` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `activeOrganizationIds` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "auth"."session" DROP COLUMN "activeOrganizationId";

-- AlterTable
ALTER TABLE "public"."Profile" DROP COLUMN "activeOrganizationIds";
