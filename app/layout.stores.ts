import { create } from "zustand";
import { AppState, RedirectState } from "./layout.types";

const initialAppState = {
  user: null,
  selectedOrganizationIds: [] as string[],
};

export const useAppStore = create<AppState>()((set) => ({
  ...initialAppState,
  setUser: (user) => set({ user }),
  setTempEmail: (tempEmail) => set({ tempEmail }),
  setSelectedOrganizationIds: (selectedOrganizationIds) => set({ selectedOrganizationIds }),
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
