// rolesStore.js

import create from 'zustand';

const useRolesStore = create((set) => ({
  roles: [],

  // Load roles from localStorage on initialization
  initRoles: () => {
    const storedRoles = localStorage.getItem('roles');
    if (storedRoles) {
      set({ roles: JSON.parse(storedRoles) });
    }
  },

  // Add a new role
  addRole: (newRole) => {
    set((state) => {
      const updatedRoles = [...state.roles, newRole];
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      return { roles: updatedRoles };
    });
  },

  // Update an existing role
  updateRole: (updatedRole) => {
    set((state) => {
      const updatedRoles = state.roles.map((role) =>
        role.id === updatedRole.id ? { ...role, ...updatedRole } : role
      );
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      return { roles: updatedRoles };
    });
  },

  // Delete a role by ID
  deleteRole: (roleId) => {
    set((state) => {
      const updatedRoles = state.roles.filter((role) => role.id !== roleId);
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      return { roles: updatedRoles };
    });
  },
}));

export default useRolesStore;
