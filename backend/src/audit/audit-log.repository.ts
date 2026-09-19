import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditLogRepository {
  constructor(private dataSource: DataSource) {}

  async log(data: {
    userId?: string;
    companyId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.dataSource.query(
      `INSERT INTO audit_logs (company_id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        data.companyId,
        data.userId || null,
        data.action,
        data.entityType,
        data.entityId,
        data.oldValues ? JSON.stringify(data.oldValues) : null,
        data.newValues ? JSON.stringify(data.newValues) : null,
        data.ipAddress || null,
        data.userAgent || null,
      ],
    );
  }

  async findByUser(userId: string, limit: number = 50) {
    return this.dataSource.query(
      `SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit],
    );
  }

  async findByCompany(companyId: string, limit: number = 50) {
    return this.dataSource.query(
      `SELECT * FROM audit_logs WHERE company_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [companyId, limit],
    );
  }
}
