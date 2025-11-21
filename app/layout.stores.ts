import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppState, RedirectState } from "./layout.types";

const initialAppState = {
  user: null,
  selectedOrganizationIds: [] as string[],
  pendingInvitations: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialAppState,
      setUser: (user) => set({ user }),
      setTempEmail: (tempEmail) => set({ tempEmail }),
      setSelectedOrganizationIds: (selectedOrganizationIds) => set({ selectedOrganizationIds }),
      setPendingInvitations: (pendingInvitations) => set({ pendingInvitations }),
      reset: () => set(initialAppState),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({ selectedOrganizationIds: state.selectedOrganizationIds }),
    }
  )
);

const initialRedirectState = {
  userData: null,
};

export const useRedirectStore = create<RedirectState>()((set) => ({
  ...initialRedirectState,
  setUserData: (userData) => set({ userData }),
  reset: () => set(initialRedirectState),
}));
