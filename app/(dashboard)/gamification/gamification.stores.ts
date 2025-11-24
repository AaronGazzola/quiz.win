"use client";

import { create } from "zustand";
import { GamificationState } from "@/lib/gamification/types";

const initialState = {
  profile: null,
  achievements: [],
  recentUnlocks: [],
};

export const useGamificationStore = create<GamificationState>()((set) => ({
  ...initialState,
  setProfile: (profile) => set({ profile }),
  addAchievement: (achievement) =>
    set((state) => ({
      achievements: [...state.achievements, achievement],
      recentUnlocks: [achievement],
    })),
  setAchievements: (achievements) => set({ achievements }),
  reset: () => set(initialState),
}));
