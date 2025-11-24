import {
  Achievement,
  UserGamificationProfile,
  UserAchievement,
  LeaderboardEntry,
  PointTransaction,
  AchievementCategory,
  AchievementTier,
  LeaderboardTimeframe,
} from "@prisma/client";

export type {
  Achievement,
  UserGamificationProfile,
  UserAchievement,
  LeaderboardEntry,
  PointTransaction,
  AchievementCategory,
  AchievementTier,
  LeaderboardTimeframe,
};

export interface GamificationState {
  profile: UserGamificationProfile | null;
  achievements: Achievement[];
  recentUnlocks: Achievement[];
  setProfile: (profile: UserGamificationProfile | null) => void;
  addAchievement: (achievement: Achievement) => void;
  setAchievements: (achievements: Achievement[]) => void;
  reset: () => void;
}

export interface AwardPointsData {
  userId: string;
  organizationId: string;
  amount: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

export interface QuizCompletionData {
  userId: string;
  organizationId: string;
  quizId: string;
  score: number;
  timeSpentMinutes?: number;
  isPerfectScore: boolean;
}

export interface AchievementUnlock {
  achievement: Achievement;
  isNew: boolean;
}

export interface GamificationRewards {
  pointsEarned: number;
  achievementsUnlocked: Achievement[];
  levelUp?: {
    oldLevel: number;
    newLevel: number;
  };
  newTotalPoints: number;
  newLevel: number;
}

export interface LeaderboardFilters {
  organizationId?: string;
  timeframe: LeaderboardTimeframe;
  limit?: number;
  offset?: number;
}

export interface UserStats {
  totalPoints: number;
  level: number;
  experiencePoints: number;
  quizzesCompleted: number;
  perfectScores: number;
  averageScore: number;
  rank?: number;
}
