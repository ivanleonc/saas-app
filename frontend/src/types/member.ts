export interface Member {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

export interface CreateMemberPayload {
  name: string;
  email: string;
  roleIds?: number[];
}

export interface MembersResponse {
  success: boolean;
  data: Member[];
}

export interface CreateMemberResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    temporary_password?: string;
    role_assigned: number;
  };
}

export interface UpdateMemberPayload {
  roleIds?: number[];
  status?: 'active' | 'inactive';
}
