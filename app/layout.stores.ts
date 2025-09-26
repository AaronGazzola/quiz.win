import { create } from "zustand";
import { AppState, RedirectState } from "./layout.types";

const initialAppState = {
  user: null,
};

export const useAppStore = create<AppState>()((set) => ({
  ...initialAppState,
  setUser: (user) => set({ user }),
  setTempEmail: (tempEmail) => set({ tempEmail }),
  reset: () => set(initialAppState),
}));

const initialRedirectState = {
  userData: null,
};

export const useRedirectStore = create<RedirectState>()((set) => ({
  ...initialRedirectState,
  setUserData: (userData) => set({ userData }),
  reset: () => set(initialRedirectState),
}));
