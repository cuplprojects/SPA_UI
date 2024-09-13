// Updated by Shivom on 06/09/2024 to remove localStorage dependency, resolving the issue of flags reappearing after page refresh.

import { create } from 'zustand';

// Define your Zustand store without localStorage
const useFlagStore = create((set) => ({
  flagData: [], // Initialize flagData as an empty array
  actions: {
    setFlagData: (data) => set({ flagData: data }), // Update flagData state
    clearFlags: () => set({ flagData: [] }), // Clear flagData
  },
}));

// Custom hooks for accessing state and actions
export const useFlagData = () => useFlagStore((state) => state.flagData);
export const useFlagActions = () => useFlagStore((state) => state.actions);
