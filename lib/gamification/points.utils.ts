import { QuizCompletionData } from "./types";

export function calculateQuizPoints(data: QuizCompletionData): number {
  const basePoints = 10;

  const accuracyBonus = Math.floor(data.score * 50);

  const perfectBonus = data.isPerfectScore ? 30 : 0;

  const speedBonus =
    data.timeSpentMinutes && data.timeSpentMinutes < 10 ? 20 : 0;

  return basePoints + accuracyBonus + perfectBonus + speedBonus;
}

export function calculatePointsWithMultiplier(
  basePoints: number,
  multiplier: number
): number {
  return Math.floor(basePoints * multiplier);
}

export function getPointsForAchievement(tier: string): number {
  switch (tier) {
    case "BRONZE":
      return 50;
    case "SILVER":
      return 100;
    case "GOLD":
      return 200;
    case "PLATINUM":
      return 500;
    case "DIAMOND":
      return 1000;
    default:
      return 50;
  }
}
