import { Achievement, UserGamificationProfile } from "@prisma/client";
import { AchievementUnlock } from "./types";

interface AchievementRequirement {
  type: string;
  value: number;
  count?: number;
}

export function checkAchievementEligibility(
  achievement: Achievement,
  profile: UserGamificationProfile,
  existingAchievements: string[]
): boolean {
  if (existingAchievements.includes(achievement.key)) {
    return false;
  }

  const requirement = achievement.requirement as unknown as AchievementRequirement;

  switch (requirement.type) {
    case "quiz_count":
      return profile.quizzesCompleted >= requirement.value;

    case "perfect_scores":
      return profile.perfectScores >= requirement.value;

    case "average_score":
      return (
        profile.quizzesCompleted >= (requirement.count || 0) &&
        profile.averageScore >= requirement.value
      );

    case "level":
      return profile.level >= requirement.value;

    default:
      return false;
  }
}

export function checkMultipleAchievements(
  achievements: Achievement[],
  profile: UserGamificationProfile,
  existingAchievementKeys: string[]
): AchievementUnlock[] {
  const unlocks: AchievementUnlock[] = [];

  for (const achievement of achievements) {
    const isEligible = checkAchievementEligibility(
      achievement,
      profile,
      existingAchievementKeys
    );

    if (isEligible) {
      unlocks.push({
        achievement,
        isNew: true,
      });
    }
  }

  return unlocks;
}

export function getAchievementsByCategory(
  achievements: Achievement[],
  category?: string
): Achievement[] {
  if (!category) return achievements;
  return achievements.filter((a) => a.category === category);
}

export function sortAchievementsByTier(
  achievements: Achievement[]
): Achievement[] {
  const tierOrder = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];
  return [...achievements].sort(
    (a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
  );
}
