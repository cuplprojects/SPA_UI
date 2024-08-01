import { d, e } from '@/Security/ParamSecurity';
import { useStore } from 'zustand';
import { create } from 'zustand';

const projectIdKey = '2dde77c1728a1b036P';

const getItem = (key) => localStorage.getItem(key);
const setItem = (key, value) => localStorage.setItem(key, value);
const removeItem = (key) => localStorage.removeItem(key);

// Define the store with Zustan
const useProjectStore = create((set) => ({
  projectId: d(getItem(projectIdKey)) || 0,
  actions: {
    setProjectId: (projectId) => {
      set({ projectId });
      setItem(projectIdKey, e(projectId));
    },
    clearProjectId: () => {
      set({ projectId: '' });
      removeItem(projectIdKey);
    },
  },
}));

export const useProjectId = () => useProjectStore((state) => state.projectId);
export const useProjectActions = () => useProjectStore((state) => state.actions);
