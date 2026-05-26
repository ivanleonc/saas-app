import { apiClient } from '@/api/axios';

export const userService = {
  async updateProfile(payload: { name: string; email: string; password?: string }) {
    const response = await apiClient.put('/user/profile', payload);
    return response.data;
  }
};