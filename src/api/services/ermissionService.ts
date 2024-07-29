import axios from 'axios';
import { Permission } from '#/entity';

const API_BASE_URL = '/api/permissions';

const permissionService = {
  createPermission: async (permission: Permission) => {
    const response = await axios.post(API_BASE_URL, permission);
    return response.data;
  },
  updatePermission: async (permission: Permission) => {
    const response = await axios.put(`${API_BASE_URL}/${permission.id}`, permission);
    return response.data;
  },
  deletePermission: async (id: string) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  },
};

export default permissionService;
