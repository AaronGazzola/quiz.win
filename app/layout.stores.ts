import { create } from "zustand";
import { AppState, RedirectState } from "./layout.types";

const initialAppState = {
  user: null,
  selectedOrganizationIds: [] as string[],
  allOrganizations: null,
  pendingInvitations: null,
};

export const useAppStore = create<AppState>()((set) => ({
  ...initialAppState,
  setUser: (user) => set({ user }),
  setTempEmail: (tempEmail) => set({ tempEmail }),
  setSelectedOrganizationIds: (selectedOrganizationIds) => set({ selectedOrganizationIds }),
  setAllOrganizations: (allOrganizations) => set({ allOrganizations }),
  setPendingInvitations: (pendingInvitations) => set({ pendingInvitations }),
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
