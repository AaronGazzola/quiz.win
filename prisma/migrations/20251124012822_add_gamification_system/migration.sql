-- CreateEnum
CREATE TYPE "public"."AchievementCategory" AS ENUM ('COMPLETION', 'ACCURACY', 'SPEED', 'STREAK', 'SOCIAL', 'SPECIAL');

-- CreateEnum
CREATE TYPE "public"."AchievementTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- CreateEnum
CREATE TYPE "public"."LeaderboardTimeframe" AS ENUM ('ALL_TIME', 'MONTHLY', 'WEEKLY', 'DAILY');

-- AlterTable
ALTER TABLE "public"."Response" ADD COLUMN     "achievementsUnlocked" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "bonusMultiplier" DOUBLE PRECISION DEFAULT 1.0,
ADD COLUMN     "pointsEarned" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."UserGamificationProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experiencePoints" INTEGER NOT NULL DEFAULT 0,
    "quizzesCompleted" INTEGER NOT NULL DEFAULT 0,
    "perfectScores" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalTimeSpentMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGamificationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Achievement" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."AchievementCategory" NOT NULL,
    "pointValue" INTEGER NOT NULL,
    "iconName" TEXT,
    "requirement" JSONB NOT NULL,
    "tier" "public"."AchievementTier" NOT NULL DEFAULT 'BRONZE',
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "timeframe" "public"."LeaderboardTimeframe" NOT NULL,
    "rank" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    "quizzesCompleted" INTEGER NOT NULL,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PointTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserGamificationProfile_organizationId_totalPoints_idx" ON "public"."UserGamificationProfile"("organizationId", "totalPoints");

-- CreateIndex
CREATE INDEX "UserGamificationProfile_organizationId_level_idx" ON "public"."UserGamificationProfile"("organizationId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "UserGamificationProfile_userId_organizationId_key" ON "public"."UserGamificationProfile"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_key_key" ON "public"."Achievement"("key");

-- CreateIndex
CREATE INDEX "Achievement_category_idx" ON "public"."Achievement"("category");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_organizationId_idx" ON "public"."UserAchievement"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_organizationId_key" ON "public"."UserAchievement"("userId", "achievementId", "organizationId");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_organizationId_timeframe_rank_idx" ON "public"."LeaderboardEntry"("organizationId", "timeframe", "rank");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_organizationId_timeframe_totalPoints_idx" ON "public"."LeaderboardEntry"("organizationId", "timeframe", "totalPoints");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_userId_organizationId_timeframe_periodStar_key" ON "public"."LeaderboardEntry"("userId", "organizationId", "timeframe", "periodStart");

-- CreateIndex
CREATE INDEX "PointTransaction_userId_organizationId_createdAt_idx" ON "public"."PointTransaction"("userId", "organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "PointTransaction_organizationId_createdAt_idx" ON "public"."PointTransaction"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."UserGamificationProfile" ADD CONSTRAINT "UserGamificationProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGamificationProfile" ADD CONSTRAINT "UserGamificationProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "auth"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "auth"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "auth"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PointTransaction" ADD CONSTRAINT "PointTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PointTransaction" ADD CONSTRAINT "PointTransaction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "auth"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
