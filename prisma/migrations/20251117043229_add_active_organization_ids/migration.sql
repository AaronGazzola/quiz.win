-- AlterTable
ALTER TABLE "public"."Profile" ADD COLUMN     "activeOrganizationIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
