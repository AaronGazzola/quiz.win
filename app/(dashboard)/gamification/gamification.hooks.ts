"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGamificationStore } from "./gamification.stores";
import {
  getUserGamificationProfileAction,
  getAllAchievementsAction,
  getUserAchievementsAction,
  getLeaderboardAction,
} from "./gamification.actions";
import { AchievementCategory, LeaderboardTimeframe } from "@prisma/client";

export const useGetGamificationProfile = (organizationId?: string) => {
  const { setProfile } = useGamificationStore();

  return useQuery({
    queryKey: ["gamification-profile", organizationId],
    queryFn: async () => {
      const { data, error } =
        await getUserGamificationProfileAction(organizationId);
      if (error) throw new Error(error);
      if (data) setProfile(data);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetAllAchievements = (category?: AchievementCategory) => {
  const { setAchievements } = useGamificationStore();

  return useQuery({
    queryKey: ["achievements", category],
    queryFn: async () => {
      const { data, error } = await getAllAchievementsAction(category);
      if (error) throw new Error(error);
      if (data) setAchievements(data);
      return data || [];
    },
    staleTime: 1000 * 60 * 30,
  });
};

export const useGetUserAchievements = (organizationId?: string) => {
  return useQuery({
    queryKey: ["user-achievements", organizationId],
    queryFn: async () => {
      const { data, error } =
        await getUserAchievementsAction(organizationId);
      if (error) throw new Error(error);
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetLeaderboard = (
  organizationId?: string,
  timeframe: LeaderboardTimeframe = "ALL_TIME",
  limit: number = 100
) => {
  return useQuery({
    queryKey: ["leaderboard", organizationId, timeframe, limit],
    queryFn: async () => {
      const { data, error } = await getLeaderboardAction({
        organizationId,
        timeframe,
        limit,
      });
      if (error) throw new Error(error);
      return data || [];
    },
    staleTime: 1000 * 60 * 2,
  });
};
