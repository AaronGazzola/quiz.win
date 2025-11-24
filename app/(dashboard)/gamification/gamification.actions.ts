"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import {
  UserGamificationProfile,
  Achievement,
  UserAchievement,
  LeaderboardEntry,
  PointTransaction,
  AchievementCategory,
  LeaderboardTimeframe,
} from "@prisma/client";
import {
  AwardPointsData,
  QuizCompletionData,
  GamificationRewards,
  LeaderboardFilters,
} from "@/lib/gamification/types";
import { calculateQuizPoints } from "@/lib/gamification/points.utils";
import {
  calculateLevel,
  checkLevelUp,
} from "@/lib/gamification/levels.utils";
import { checkMultipleAchievements } from "@/lib/gamification/achievements.utils";
import { getLeaderboardPeriod } from "@/lib/gamification/leaderboard.utils";

export const getUserGamificationProfileAction = async (
  organizationId?: string
): Promise<ActionResponse<UserGamificationProfile | null>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    if (!organizationId) {
      const userMemberships = await db.member.findMany({
        where: { userId: user.id },
        select: { organizationId: true },
      });

      const orgIds = userMemberships.map((m) => m.organizationId);

      if (orgIds.length === 0) {
        return getActionResponse({ data: null });
      }

      const profiles = await db.userGamificationProfile.findMany({
        where: {
          userId: user.id,
          organizationId: { in: orgIds },
        },
      });

      if (profiles.length === 0) {
        return getActionResponse({ data: null });
      }

      const aggregated: UserGamificationProfile = {
        id: `aggregated-${user.id}`,
        userId: user.id,
        organizationId: "all",
        totalPoints: profiles.reduce((sum, p) => sum + p.totalPoints, 0),
        level: Math.max(...profiles.map((p) => p.level)),
        experiencePoints: profiles.reduce((sum, p) => sum + p.experiencePoints, 0),
        quizzesCompleted: profiles.reduce((sum, p) => sum + p.quizzesCompleted, 0),
        perfectScores: profiles.reduce((sum, p) => sum + p.perfectScores, 0),
        averageScore:
          profiles.reduce((sum, p) => sum + p.averageScore * p.quizzesCompleted, 0) /
          profiles.reduce((sum, p) => sum + p.quizzesCompleted, 0) || 0,
        totalTimeSpentMinutes: profiles.reduce((sum, p) => sum + p.totalTimeSpentMinutes, 0),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return getActionResponse({ data: aggregated });
    }

    const profile = await db.userGamificationProfile.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    return getActionResponse({ data: profile });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getOrCreateGamificationProfileAction = async (
  userId: string,
  organizationId: string
): Promise<ActionResponse<UserGamificationProfile>> => {
  try {
    const { db } = await getAuthenticatedClient();

    let profile = await db.userGamificationProfile.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!profile) {
      profile = await db.userGamificationProfile.create({
        data: {
          userId,
          organizationId,
          totalPoints: 0,
          level: 1,
          experiencePoints: 0,
          quizzesCompleted: 0,
          perfectScores: 0,
          averageScore: 0,
          totalTimeSpentMinutes: 0,
        },
      });
    }

    return getActionResponse({ data: profile });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const processQuizCompletionAction = async (
  data: QuizCompletionData
): Promise<ActionResponse<GamificationRewards>> => {
  try {
    const { db } = await getAuthenticatedClient();

    const profileResult = await getOrCreateGamificationProfileAction(
      data.userId,
      data.organizationId
    );

    if (profileResult.error || !profileResult.data) {
      return getActionResponse({
        error: profileResult.error || "Failed to get profile",
      });
    }

    const currentProfile = profileResult.data;

    const pointsEarned = calculateQuizPoints(data);

    const newQuizzesCompleted = currentProfile.quizzesCompleted + 1;
    const newPerfectScores = data.isPerfectScore
      ? currentProfile.perfectScores + 1
      : currentProfile.perfectScores;

    const newAverageScore =
      (currentProfile.averageScore * currentProfile.quizzesCompleted +
        data.score) /
      newQuizzesCompleted;

    const newExperiencePoints = currentProfile.experiencePoints + pointsEarned;
    const newLevel = calculateLevel(newExperiencePoints);

    const levelUpInfo = checkLevelUp(
      currentProfile.experiencePoints,
      newExperiencePoints
    );

    const updatedProfile = await db.userGamificationProfile.update({
      where: {
        userId_organizationId: {
          userId: data.userId,
          organizationId: data.organizationId,
        },
      },
      data: {
        totalPoints: currentProfile.totalPoints + pointsEarned,
        experiencePoints: newExperiencePoints,
        level: newLevel,
        quizzesCompleted: newQuizzesCompleted,
        perfectScores: newPerfectScores,
        averageScore: newAverageScore,
        totalTimeSpentMinutes:
          currentProfile.totalTimeSpentMinutes + (data.timeSpentMinutes || 0),
      },
    });

    await db.pointTransaction.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        amount: pointsEarned,
        reason: "quiz_completion",
        referenceType: "quiz",
        referenceId: data.quizId,
        metadata: {
          score: data.score,
          isPerfectScore: data.isPerfectScore,
          timeSpentMinutes: data.timeSpentMinutes,
        },
      },
    });

    const allAchievements = await db.achievement.findMany();

    const existingUserAchievements = await db.userAchievement.findMany({
      where: {
        userId: data.userId,
        organizationId: data.organizationId,
      },
      select: {
        achievement: {
          select: {
            key: true,
          },
        },
      },
    });

    const existingAchievementKeys = existingUserAchievements.map(
      (ua) => ua.achievement.key
    );

    const newAchievements = checkMultipleAchievements(
      allAchievements,
      updatedProfile,
      existingAchievementKeys
    );

    const unlockedAchievements: Achievement[] = [];

    for (const unlock of newAchievements) {
      await db.userAchievement.create({
        data: {
          userId: data.userId,
          achievementId: unlock.achievement.id,
          organizationId: data.organizationId,
          isCompleted: true,
        },
      });

      await db.pointTransaction.create({
        data: {
          userId: data.userId,
          organizationId: data.organizationId,
          amount: unlock.achievement.pointValue,
          reason: "achievement_unlock",
          referenceType: "achievement",
          referenceId: unlock.achievement.id,
          metadata: {
            achievementKey: unlock.achievement.key,
            achievementName: unlock.achievement.name,
          },
        },
      });

      unlockedAchievements.push(unlock.achievement);
    }

    if (unlockedAchievements.length > 0) {
      const bonusPoints = unlockedAchievements.reduce(
        (sum, a) => sum + a.pointValue,
        0
      );
      await db.userGamificationProfile.update({
        where: {
          userId_organizationId: {
            userId: data.userId,
            organizationId: data.organizationId,
          },
        },
        data: {
          totalPoints: updatedProfile.totalPoints + bonusPoints,
        },
      });
    }

    const rewards: GamificationRewards = {
      pointsEarned,
      achievementsUnlocked: unlockedAchievements,
      levelUp: levelUpInfo.leveledUp ? levelUpInfo : undefined,
      newTotalPoints:
        updatedProfile.totalPoints +
        unlockedAchievements.reduce((sum, a) => sum + a.pointValue, 0),
      newLevel: updatedProfile.level,
    };

    return getActionResponse({ data: rewards });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getAllAchievementsAction = async (
  category?: AchievementCategory
): Promise<ActionResponse<Achievement[]>> => {
  try {
    const { db } = await getAuthenticatedClient();

    const achievements = await db.achievement.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: "asc" }, { tier: "asc" }],
    });

    return getActionResponse({ data: achievements });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getUserAchievementsAction = async (
  organizationId?: string
): Promise<ActionResponse<UserAchievement[]>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    if (!organizationId) {
      const userMemberships = await db.member.findMany({
        where: { userId: user.id },
        select: { organizationId: true },
      });

      const orgIds = userMemberships.map((m) => m.organizationId);

      if (orgIds.length === 0) {
        return getActionResponse({ data: [] });
      }

      const userAchievements = await db.userAchievement.findMany({
        where: {
          userId: user.id,
          organizationId: { in: orgIds },
        },
        include: {
          achievement: true,
        },
        orderBy: {
          unlockedAt: "desc",
        },
      });

      return getActionResponse({ data: userAchievements });
    }

    const userAchievements = await db.userAchievement.findMany({
      where: {
        userId: user.id,
        organizationId,
      },
      include: {
        achievement: true,
      },
      orderBy: {
        unlockedAt: "desc",
      },
    });

    return getActionResponse({ data: userAchievements });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export const getLeaderboardAction = async (
  filters: LeaderboardFilters
): Promise<ActionResponse<LeaderboardEntry[]>> => {
  try {
    const { db, user } = await getAuthenticatedClient();

    if (!user) {
      return getActionResponse({ error: "Unauthorized" });
    }

    const { start, end } = getLeaderboardPeriod(filters.timeframe);

    if (!filters.organizationId) {
      const userMemberships = await db.member.findMany({
        where: { userId: user.id },
        select: { organizationId: true },
      });

      const orgIds = userMemberships.map((m) => m.organizationId);

      if (orgIds.length === 0) {
        return getActionResponse({ data: [] });
      }

      const profiles = await db.userGamificationProfile.findMany({
        where: {
          organizationId: { in: orgIds },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          totalPoints: "desc",
        },
        take: filters.limit || 100,
        skip: filters.offset || 0,
      });

      const leaderboardEntries: LeaderboardEntry[] = profiles.map(
        (profile, index) => ({
          id: `${profile.userId}-${filters.timeframe}`,
          userId: profile.userId,
          organizationId: profile.organizationId,
          timeframe: filters.timeframe,
          rank: (filters.offset || 0) + index + 1,
          totalPoints: profile.totalPoints,
          quizzesCompleted: profile.quizzesCompleted,
          averageScore: profile.averageScore,
          periodStart: start,
          periodEnd: end,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );

      return getActionResponse({ data: leaderboardEntries });
    }

    const profiles = await db.userGamificationProfile.findMany({
      where: {
        organizationId: filters.organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        totalPoints: "desc",
      },
      take: filters.limit || 100,
      skip: filters.offset || 0,
    });

    const leaderboardEntries: LeaderboardEntry[] = profiles.map(
      (profile, index) => ({
        id: `${profile.userId}-${filters.timeframe}`,
        userId: profile.userId,
        organizationId: profile.organizationId,
        timeframe: filters.timeframe,
        rank: (filters.offset || 0) + index + 1,
        totalPoints: profile.totalPoints,
        quizzesCompleted: profile.quizzesCompleted,
        averageScore: profile.averageScore,
        periodStart: start,
        periodEnd: end,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    return getActionResponse({ data: leaderboardEntries });
  } catch (error) {
    return getActionResponse({ error });
  }
};
