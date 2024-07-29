// permissionStore.ts
import { create } from 'zustand';
import { PermissionType } from './../../types/enum';

type Permission = {
  id: string;
  name: string;
  type: PermissionType;
};

type PermissionStore = {
  permissions: Permission[];
  actions: {
    setPermissions: (permissions: Permission[]) => void;
    clearPermissions: () => void;
  };
};

const usePermissionStore = create<PermissionStore>((set) => ({
  permissions: [],
  actions: {
    setPermissions: (permissions) => set({ permissions }),
    clearPermissions: () => set({ permissions: [] }),
  },
}));

export const usePermissions = () => usePermissionStore((state) => state.permissions);
export const usePermissionActions = () => usePermissionStore((state) => state.actions);
