import { LeaderboardTimeframe } from "@prisma/client";

export function getLeaderboardPeriod(
  timeframe: LeaderboardTimeframe
): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);

  let start: Date;

  switch (timeframe) {
    case "DAILY":
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "WEEKLY":
      start = new Date(now);
      const dayOfWeek = start.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start.setDate(start.getDate() - daysToMonday);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;

    case "MONTHLY":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "ALL_TIME":
    default:
      start = new Date(2020, 0, 1);
      end.setFullYear(end.getFullYear() + 10);
      break;
  }

  return { start, end };
}

export function calculateRank(
  totalPoints: number,
  allScores: number[]
): number {
  const sortedScores = [...allScores].sort((a, b) => b - a);
  return sortedScores.indexOf(totalPoints) + 1;
}

export function formatRank(rank: number): string {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
}
