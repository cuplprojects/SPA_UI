// api/services/roleService.ts

import { Role } from '#/entity';

const API_URL = '/api/roles'; // Replace with your actual API endpoint URL

export const fetchRoles = async (): Promise<Role[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }
    const data: Role[] = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to fetch roles');
  }
};

export const createRole = async (role: Role): Promise<Role> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(role),
    });
    if (!response.ok) {
      throw new Error('Failed to create role');
    }
    const data: Role = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to create role');
  }
};

export const updateRole = async (role: Role): Promise<Role> => {
  try {
    const response = await fetch(`${API_URL}/${role.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(role),
    });
    if (!response.ok) {
      throw new Error('Failed to update role');
    }
    const data: Role = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to update role');
  }
};

export const deleteRole = async (roleId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${roleId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete role');
    }
  } catch (error) {
    throw new Error('Failed to delete role');
  }
};
