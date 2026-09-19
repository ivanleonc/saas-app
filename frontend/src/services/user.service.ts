import { apiClient } from '@/api/axios';

export const userService = {
  async updateProfile(payload: { name: string; email: string }) {
    const response = await apiClient.put('/auth/profile', payload);
    return response.data;
  }
};