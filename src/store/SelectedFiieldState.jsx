import { create } from 'zustand';

// Define the storage key as a constant
const SELECTED_FIELD_KEY = 'selectedField';

const useSelectedFieldStore = create((set) => ({
  selectedField: localStorage.getItem(SELECTED_FIELD_KEY) || 'all',
  actions: {
    setSelectedField: (selectedField) => {
      set({ selectedField });
      localStorage.setItem(SELECTED_FIELD_KEY, selectedField);
    },
    clearSelectedField: () => {
      set({ selectedField: '' });
      localStorage.removeItem(SELECTED_FIELD_KEY);
    },
  },
}));

export const useSelectedField = () => useSelectedFieldStore((state) => state.selectedField);
export const useSelectedFieldActions = () => useSelectedFieldStore((state) => state.actions);