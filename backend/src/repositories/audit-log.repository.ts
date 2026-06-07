import { pool } from '@/config/db';
import type { IAuditLogRepository, IAuditLogData } from './interfaces/audit-log.repository.interface';

export class AuditLogRepository implements IAuditLogRepository {
  async createLog(data: IAuditLogData): Promise<void> {
    const query = `
      INSERT INTO audit_logs (
        company_id, 
        user_id, 
        action, 
        model_type, 
        model_id, 
        old_values, 
        new_values, 
        ip_address, 
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    const values = [
      data.companyId, 
      data.userId, 
      data.action, 
      data.modelType, 
      data.modelId,
      data.oldValues ? JSON.stringify(data.oldValues) : null,
      data.newValues ? JSON.stringify(data.newValues) : null,
      data.ipAddress || null, 
      data.userAgent || null
    ];
    
    await pool.query(query, values);
  }
}