import { apiClient } from '@/api/axios';
import type { MembersResponse, CreateMemberResponse, CreateMemberPayload, UpdateMemberPayload } from '@/types/member';

export class MemberService {
  async getMembers(companyId: string): Promise<MembersResponse> {
    const response = await apiClient.get<MembersResponse>('/companies/users', {
      headers: { 'x-company-id': companyId }
    });
    return response.data;
  }

  async addMember(companyId: string, payload: CreateMemberPayload): Promise<CreateMemberResponse> {
    const response = await apiClient.post<CreateMemberResponse>('/companies/users', payload, {
      headers: { 'x-company-id': companyId }
    });
    return response.data;
  }

  async updateMember(companyId: string, userId: string, payload: UpdateMemberPayload) {
    const response = await apiClient.patch(`/companies/users/${userId}`, payload, {
      headers: { 'x-company-id': companyId }
    });
    return response.data;
  }

  async removeMember(companyId: string, userId: string) {
    const response = await apiClient.delete(`/companies/users/${userId}`, {
      headers: { 'x-company-id': companyId }
    });
    return response.data;
  }
}

export const memberService = new MemberService();
