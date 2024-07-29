import { create } from 'zustand';

// Define the storage key as a constant
const PROJECT_ID_KEY = 'projectId';

const useProjectStore = create((set) => ({
  projectId: localStorage.getItem(PROJECT_ID_KEY) || '',
  actions: {
    setProjectId: (projectId) => {
      set({ projectId });
      localStorage.setItem(PROJECT_ID_KEY, projectId);
    },
    clearProjectId: () => {
      set({ projectId: '' });
      localStorage.removeItem(PROJECT_ID_KEY);
    },
  },
}));

export const useProjectId = () => useProjectStore((state) => state.projectId);
export const useProjectActions = () => useProjectStore((state) => state.actions);
