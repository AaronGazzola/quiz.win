import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppState, RedirectState } from "./layout.types";

const initialAppState = {
  user: null,
  activeOrganization: null,
};

export const useAppStore = create<AppState>()((set) => ({
  ...initialAppState,
  setUser: (user) => set({ user }),
  setActiveOrganization: (activeOrganization) => set({ activeOrganization }),
  setTempEmail: (tempEmail) => set({ tempEmail }),
  reset: () => set(initialAppState),
}));

const initialRedirectState = {
  userData: null,
};

export const useRedirectStore = create<RedirectState>()(
  persist(
    (set) => ({
      ...initialRedirectState,
      setUserData: (userData) => set({ userData }),
      reset: () => set(initialRedirectState),
    }),
    {
      name: "redirect-storage",
    }
  )
);