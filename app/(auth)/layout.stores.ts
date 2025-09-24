import { create } from "zustand";
import { AuthLayoutState } from "./layout.types";

const initialState = {
  isLoading: false,
};

export const useAuthLayoutStore = create<AuthLayoutState>()((set) => ({
  ...initialState,
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialState),
}));