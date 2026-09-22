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
    responseStatus?: number;
    responseData?: any;
    durationMs?: number;
  }) {
    await this.dataSource.query(
      `INSERT INTO audit_logs (company_id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, response_status, response_data, duration_ms) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
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
        data.responseStatus || null,
        data.responseData ? JSON.stringify(data.responseData) : null,
        data.durationMs || null,
      ],
    );
  }

  async findFiltered(params: {
    companyId: string;
    entityType?: string;
    action?: string;
    userId?: string;
    from?: string;
    to?: string;
    page: number;
    limit: number;
  }) {
    const { companyId, entityType, action, userId, from, to, page, limit } = params;
    const conditions: string[] = ['al.company_id = $1'];
    const values: any[] = [companyId];
    let idx = 2;

    if (entityType) {
      conditions.push(`al.entity_type = $${idx}`);
      values.push(entityType);
      idx++;
    }
    if (action) {
      conditions.push(`al.action ILIKE $${idx}`);
      values.push(`%${action}%`);
      idx++;
    }
    if (userId) {
      conditions.push(`al.user_id = $${idx}`);
      values.push(userId);
      idx++;
    }
    if (from) {
      conditions.push(`al.created_at >= $${idx}`);
      values.push(from);
      idx++;
    } else {
      const defaultFrom = new Date();
      defaultFrom.setDate(defaultFrom.getDate() - 30);
      conditions.push(`al.created_at >= $${idx}`);
      values.push(defaultFrom.toISOString());
      idx++;
    }
    if (to) {
      conditions.push(`al.created_at <= $${idx}`);
      values.push(to);
      idx++;
    }

    const where = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const countResult = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM audit_logs al WHERE ${where}`,
      values,
    );
    const total = parseInt(countResult[0]?.total || '0', 10);

    const data = await this.dataSource.query(
      `SELECT al.id, al.action, al.entity_type, al.entity_id,
              al.new_values, al.old_values, al.ip_address, al.user_agent, al.created_at,
              al.response_status, al.response_data, al.duration_ms,
              al.user_id,
              u.name as user_name, u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE ${where}
       ORDER BY al.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset],
    );

    return { data, total, page, limit };
  }

  async findForExport(params: {
    companyId: string;
    entityType?: string;
    action?: string;
    userId?: string;
    from?: string;
    to?: string;
  }) {
    const { companyId, entityType, action, userId, from, to } = params;
    const conditions: string[] = ['al.company_id = $1'];
    const values: any[] = [companyId];
    let idx = 2;

    if (entityType) {
      conditions.push(`al.entity_type = $${idx}`);
      values.push(entityType);
      idx++;
    }
    if (action) {
      conditions.push(`al.action ILIKE $${idx}`);
      values.push(`%${action}%`);
      idx++;
    }
    if (userId) {
      conditions.push(`al.user_id = $${idx}`);
      values.push(userId);
      idx++;
    }
    if (from) {
      conditions.push(`al.created_at >= $${idx}`);
      values.push(from);
      idx++;
    } else {
      const defaultFrom = new Date();
      defaultFrom.setDate(defaultFrom.getDate() - 30);
      conditions.push(`al.created_at >= $${idx}`);
      values.push(defaultFrom.toISOString());
      idx++;
    }
    if (to) {
      conditions.push(`al.created_at <= $${idx}`);
      values.push(to);
      idx++;
    }

    const where = conditions.join(' AND ');

    return this.dataSource.query(
      `SELECT al.action, al.entity_type, al.entity_id,
              al.old_values, al.new_values, al.ip_address, al.user_agent, al.created_at,
              u.name as user_name, u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE ${where}
       ORDER BY al.created_at DESC
       LIMIT 5000`,
      values,
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

  async getEntityTypes(companyId: string) {
    return this.dataSource.query(
      `SELECT DISTINCT entity_type FROM audit_logs WHERE company_id = $1 ORDER BY entity_type`,
      [companyId],
    );
  }
}
