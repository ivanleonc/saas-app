export interface Member {
  id: number;
  name: string;
  email: string;
  role_name: 'Owner' | 'Admin';
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

export interface CreateMemberPayload {
  name: string;
  email: string;
  roleIds: number; // 1 para Owner, 2 para Admin (según tus tablas semilla)
}

// Interfaz para la respuesta estructurada de tu apiResponse.ts
export interface MembersResponse {
  success: boolean;
  message: string;
  data: Member[];
}

export interface CreateMemberResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    email: string;
    temporary_password: string;
    role_assigned: number;
  };
}

export interface UpdateMemberPayload {
  roleIds?: number;
  status?: 'active' | 'inactive';
}