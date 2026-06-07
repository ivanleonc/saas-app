export interface IAuditLogData {
  companyId: number | null;
  userId: number | null;
  action: string;
  modelType: string | null;
  modelId: number | null;
  oldValues?: any | null;
  newValues?: any | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface IAuditLogRepository {
  createLog(data: IAuditLogData): Promise<void>;
}