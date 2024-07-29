import { create } from 'zustand';

// Define the storage key as a constant
const DATABASE_ID_KEY = 'database';

const useDatabaseStore = create((set) => ({
  database: localStorage.getItem(DATABASE_ID_KEY) || '',
  actions: {
    setDatabase: (database) => {
      set({ database });
      localStorage.setItem(DATABASE_ID_KEY, database);
    },
    clearDatabase: () => {
      set({ database: '' });
      localStorage.removeItem(DATABASE_ID_KEY);
    },
  },
}));

export const useDatabase = () => useDatabaseStore((state) => state.database);
export const useDatabaseActions = () => useDatabaseStore((state) => state.actions);
