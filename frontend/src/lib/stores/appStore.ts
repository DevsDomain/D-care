/**
 * D-care App Store
 * Simple Zustand store for shared application state
 */

import { create } from 'zustand';
import type { User, SearchFilters, Elder } from '../types';

interface AppState {
  // User & Authentication
  currentUser: User | null;
  userRole: 'family' | 'caregiver' | null;
  
  // Search & Filters
  searchFilters: SearchFilters;
  
  // Current Context
  selectedElder: Elder | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setUserRole: (role: 'family' | 'caregiver' | null) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  setSelectedElder: (elder: Elder | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  currentUser: null,
  userRole: null,
  searchFilters: {},
  selectedElder: null,
  isLoading: false,
  error: null,
  
  // Actions
  setCurrentUser: (user) => set({ currentUser: user, userRole: user?.role || null }),
  setUserRole: (role) => set({ userRole: role }),
  setSearchFilters: (filters) => set({ searchFilters: filters }),
  setSelectedElder: (elder) => set({ selectedElder: elder }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

// Selectors for convenience
export const useCurrentUser = () => useAppStore((state) => state.currentUser);
export const useUserRole = () => useAppStore((state) => state.userRole);
export const useSearchFilters = () => useAppStore((state) => state.searchFilters);
export const useSelectedElder = () => useAppStore((state) => state.selectedElder);
export const useAppLoading = () => useAppStore((state) => state.isLoading);
export const useAppError = () => useAppStore((state) => state.error);