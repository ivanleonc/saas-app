export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  new_values?: Record<string, any>;
  old_values?: Record<string, any>;
  response_status?: number;
  response_data?: Record<string, any>;
  duration_ms?: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
}

export interface AuditLogResponse {
  success: boolean;
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditFilters {
  entityType?: string;
  action?: string;
  userId?: string;
  from?: string;
  to?: string;
}
