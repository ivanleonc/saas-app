import { apiClient } from '@/api/axios';
import type { MembersResponse, CreateMemberResponse, CreateMemberPayload, UpdateMemberPayload } from '@/types/member';

export class MemberService {
  // GET: Obtiene los miembros del tenant actual
  // Pasamos el companyId en los headers para que el Middleware Global del backend valide el acceso
  async getMembers(companyId: number): Promise<MembersResponse> {
    const response = await apiClient.get<MembersResponse>('/companies/users', {
      headers: {
        'x-company-id': companyId.toString()
      }
    });
    return response.data;
  }

  // POST: Registra un nuevo miembro en la empresa
  async addMember(companyId: number, payload: CreateMemberPayload): Promise<CreateMemberResponse> {
    const response = await apiClient.post<CreateMemberResponse>('/companies/users', payload, {
      headers: {
        'x-company-id': companyId.toString()
      }
    });
    return response.data;
  }

  // PATCH: Actualizar rol o estado del miembro
  async updateMember(companyId: number, userId: number, payload: UpdateMemberPayload) {
    const response = await apiClient.patch(`/companies/users/${userId}`, payload, {
      headers: { 'x-company-id': companyId.toString() }
    });
    return response.data;
  }

  // DELETE: Remover a un miembro de la empresa
  async removeMember(companyId: number, userId: number) {
    const response = await apiClient.delete(`/companies/users/${userId}`, {
      headers: { 'x-company-id': companyId.toString() }
    });
    return response.data;
  }
}

// Exportamos la instancia única (Patrón Singleton)
export const memberService = new MemberService();