import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, SearchFilters, Elder } from "../types";

interface AppState {
  currentUser: User | null;
  userRole: "FAMILY" | "CAREGIVER" | null;
  searchFilters: SearchFilters;
  selectedElder: Elder | null;
  isLoading: boolean;
  error: string | null;

  setCurrentUser: (user: User | null) => void;
  setUserRole: (role: "FAMILY" | "CAREGIVER" | null) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  setSelectedElder: (elder: Elder | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetApp: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      userRole: null,
      searchFilters: {},
      selectedElder: null,
      isLoading: false,
      error: null,

      setCurrentUser: (user) =>
        set({ currentUser: user, userRole: user?.role || null }),
      setUserRole: (role) => set({ userRole: role }),
      setSearchFilters: (filters) => set({ searchFilters: filters }),
      setSelectedElder: (elder) => set({ selectedElder: elder }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      resetApp: () =>
        set({
          currentUser: null,
          userRole: null,
          searchFilters: {},
          selectedElder: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "dcare-app-store", // localStorage key
      partialize: (state) => ({
        currentUser: state.currentUser,
        userRole: state.userRole,
      }),
    }
  )
);
