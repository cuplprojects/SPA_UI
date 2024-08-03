import { create } from 'zustand';

// Define the storage key as a constant
const FLAG_DATA_KEY = 'flagData';

const useFlagStore = create((set) => ({
  flagData: localStorage.getItem(FLAG_DATA_KEY)? JSON.parse(localStorage.getItem(FLAG_DATA_KEY)) : [],
  actions: {
    setFlagData: (data) => {
      set({ flagData: data });
      localStorage.setItem(FLAG_DATA_KEY, JSON.stringify(data));
    },
   
    clearFlags: () => {
      set({ flagData: [], remainingFlags: 0 });
      localStorage.removeItem(FLAG_DATA_KEY);
    },
  },
}));

export const useFlagData = () => useFlagStore((state) => state.flagData);
export const useFlagActions = () => useFlagStore((state) => state.actions);
