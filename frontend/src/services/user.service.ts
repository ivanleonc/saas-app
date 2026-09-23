import { apiClient } from '@/api/axios';

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  position?: string;
  document_type?: string;
  document_number?: string;
  timezone?: string;
  locale?: string;
}

export const userService = {
  async updateProfile(payload: UpdateProfilePayload) {
    const response = await apiClient.put('/auth/profile', payload);
    return response.data;
  }
};