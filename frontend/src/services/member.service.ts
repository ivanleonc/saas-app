import { apiClient } from '@/api/axios';
import type { MembersResponse, CreateMemberResponse, CreateMemberPayload, UpdateMemberPayload } from '@/types/member';

export const memberService = {
  async getMembers(): Promise<MembersResponse> {
    const response = await apiClient.get<MembersResponse>('/companies/users');
    return response.data;
  },

  async addMember(payload: CreateMemberPayload): Promise<CreateMemberResponse> {
    const response = await apiClient.post<CreateMemberResponse>('/companies/users', payload);
    return response.data;
  },

  async updateMember(userId: string, payload: UpdateMemberPayload) {
    const response = await apiClient.patch(`/companies/users/${userId}`, payload);
    return response.data;
  },

  async removeMember(userId: string) {
    const response = await apiClient.delete(`/companies/users/${userId}`);
    return response.data;
  },
};
