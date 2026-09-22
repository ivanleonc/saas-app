import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuditLogService } from './audit-log.service.js';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private auditLogService: AuditLogService,
    private dataSource: DataSource,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;
    const userAgent = headers['user-agent'];
    const companyId = headers['x-company-id'] || user?.tenants?.[0]?.id;

    if (url.includes('/audit')) {
      return next.handle();
    }

    const startTime = Date.now();
    const isMutation = method === 'PUT' || method === 'PATCH' || method === 'DELETE' || method === 'POST';
    const entityType = this.extractEntityType(url);
    const normalizedUrl = this.normalizeUrl(url);
    const entityId = this.extractEntityId(url, body);

    const sanitizedBody = isMutation ? this.sanitizeBody(body) : undefined;

    const oldValuesPromise = isMutation && companyId
      ? this.fetchOldValues(entityType, entityId, companyId, user?.id)
      : Promise.resolve(null);

    const newValuesPromise = isMutation
      ? this.enrichNewValues(entityType, sanitizedBody, companyId).catch(() => sanitizedBody)
      : Promise.resolve(undefined);

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;

        let newEntityId = entityId;
        if (method === 'POST' && response?.data && typeof response.data === 'object') {
          newEntityId = response.data.id
            || response.data.company?.id
            || response.data.user?.id
            || entityId;
        }

        const resolvedUserId = user?.id || response?.data?.user?.id || response?.user?.id;
        const effectiveCompanyId = companyId || response?.data?.user?.tenants?.[0]?.id;
        const sanitizedResponse = isMutation ? this.sanitizeResponse(response) : undefined;

        if (isMutation) {
          this.logger.log(`Audit: ${method} ${normalizedUrl} → companyId=${effectiveCompanyId}, entity=${entityType}, id=${newEntityId}`);
        }
        this.logger.debug(`${method} ${normalizedUrl} 200 ${duration}ms`);

        Promise.all([oldValuesPromise.catch(() => null), newValuesPromise]).then(([oldValues, newValues]) => {
          this.auditLogService.log({
            userId: resolvedUserId,
            companyId: effectiveCompanyId,
            action: `${method} ${normalizedUrl}`,
            entityType,
            entityId: newEntityId,
            oldValues: oldValues || undefined,
            newValues: newValues || undefined,
            ipAddress: ip,
            userAgent,
            responseStatus: 200,
            responseData: sanitizedResponse,
            durationMs: duration,
          }).catch((err) => {
            this.logger.error(`Audit write failed for ${method} ${normalizedUrl}: ${err.message}`);
          });
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || error.statusCode || 500;

        this.logger.debug(`${method} ${normalizedUrl} ${statusCode} ${duration}ms`);

        Promise.all([oldValuesPromise.catch(() => null), newValuesPromise]).then(([oldValues, newValues]) => {
          this.auditLogService.log({
            userId: user?.id,
            companyId,
            action: `${method} ${normalizedUrl}`,
            entityType,
            entityId,
            oldValues: oldValues || undefined,
            newValues: newValues || undefined,
            ipAddress: ip,
            userAgent,
            responseStatus: statusCode,
            responseData: {
              error: true,
              message: error.message || 'Unknown error',
              code: error.code || 'INTERNAL_ERROR',
            },
            durationMs: duration,
          }).catch((err) => {
            this.logger.error(`Audit write failed for ${method} ${normalizedUrl}: ${err.message}`);
          });
        });

        return throwError(() => error);
      }),
    );
  }

  private sanitizeResponse(response: any): any {
    if (!response) return undefined;
    if (response.data && typeof response.data === 'object') {
      const sanitized = { ...response.data };
      const sensitiveFields = [
        'access_token', 'refresh_token', 'accessToken', 'refreshToken',
        'token', 'password', 'temporary_password', 'temporaryPassword',
      ];
      for (const field of sensitiveFields) {
        if (sanitized[field]) sanitized[field] = '[REDACTED]';
      }
      return sanitized;
    }
    return undefined;
  }

  private async fetchOldValues(entityType: string, entityId: string, companyId: string, userId?: string): Promise<any> {
    if (!entityId || entityId === '00000000-0000-0000-0000-000000000000') return null;

    try {
      switch (entityType) {
        case 'Company': {
          const rows = await this.dataSource.query(
            `SELECT id, name, tax_id, is_active FROM companies WHERE id = $1`, [entityId]
          );
          return rows[0] || null;
        }
        case 'User': {
          const rows = await this.dataSource.query(
            `SELECT id, email, name, must_change_password, email_verified FROM users WHERE id = $1`, [entityId]
          );
          return rows[0] || null;
        }
        case 'Role': {
          const rows = await this.dataSource.query(
            `SELECT id, name, company_id FROM roles WHERE id = $1 AND deleted_at IS NULL`, [entityId]
          );
          if (!rows[0]) return null;
          const permRows = await this.dataSource.query(
            `SELECT p.name FROM role_permissions rp
             INNER JOIN permissions p ON p.id = rp.permission_id
             WHERE rp.role_id = $1
             ORDER BY p.name`, [entityId]
          );
          let companyName: string | null = null;
          if (rows[0].company_id) {
            const compRows = await this.dataSource.query(
              `SELECT name FROM companies WHERE id = $1`, [rows[0].company_id]
            );
            companyName = compRows[0]?.name || null;
          }
          return {
            id: rows[0].id,
            name: rows[0].name,
            company: companyName || 'Sistema',
            permissions: permRows.map((r: any) => r.name),
          };
        }
        case 'Auth': {
          const targetId = entityId !== '00000000-0000-0000-0000-000000000000' ? entityId : userId;
          if (!targetId) return null;
          const rows = await this.dataSource.query(
            `SELECT id, email, name FROM users WHERE id = $1`, [targetId]
          );
          return rows[0] || null;
        }
        case 'Branch': {
          const rows = await this.dataSource.query(
            `SELECT id, name, address, city, state, country, is_active FROM branches WHERE id = $1 AND deleted_at IS NULL`, [entityId]
          );
          return rows[0] || null;
        }
        case 'Member': {
          const rows = await this.dataSource.query(
            `SELECT id, email, name,
              CASE WHEN locked_until IS NOT NULL AND locked_until > NOW()
                THEN 'inactive' ELSE 'active'
              END as status
             FROM users WHERE id = $1`, [entityId]
          );
          if (!rows[0]) return null;
          const roleRows = await this.dataSource.query(
            `SELECT r.name FROM user_contexts uc
             LEFT JOIN roles r ON uc.role_id = r.id
             WHERE uc.user_id = $1 AND uc.company_id = $2`,
            [entityId, companyId]
          );
          return {
            ...rows[0],
            roles: roleRows.map((r: any) => r.name).filter(Boolean),
          };
        }
        case 'Settings': {
          const rows = await this.dataSource.query(
            `SELECT id, name, tax_id, is_active FROM companies WHERE id = $1`, [entityId]
          );
          return rows[0] || null;
        }
        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  private async enrichNewValues(entityType: string, body: any, companyId?: string): Promise<any> {
    if (!body || typeof body !== 'object') return body;
    try {
      if (entityType === 'Member' && Array.isArray(body.roleIds)) {
        const { roleIds, ...rest } = body;
        if (roleIds.length === 0) return { ...rest, roles: [] };
        const rows = await this.dataSource.query(
          `SELECT name FROM roles WHERE id = ANY($1) AND deleted_at IS NULL ORDER BY name`,
          [roleIds],
        );
        return { ...rest, roles: rows.map((r: any) => r.name) };
      }
      if (entityType === 'Role' && Array.isArray(body.permissionIds)) {
        const { permissionIds, ...rest } = body;
        if (permissionIds.length === 0) return { ...rest, permissions: [] };
        const rows = await this.dataSource.query(
          `SELECT name FROM permissions WHERE id = ANY($1) ORDER BY name`,
          [permissionIds],
        );
        return { ...rest, permissions: rows.map((r: any) => r.name) };
      }
    } catch {
      // Fall through to raw body on any lookup failure
    }
    return body;
  }

  private normalizeUrl(url: string): string {
    return url.replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      ':id',
    );
  }

  private extractEntityType(url: string): string {
    if (url.includes('/auth')) return 'Auth';
    if (url.includes('/audit')) return 'Audit';
    if (url.includes('/permissions')) return 'Permission';
    if (url.includes('/roles')) return 'Role';
    if (url.includes('/settings')) return 'Settings';
    if (url.includes('/branches')) return 'Branch';
    if (url.includes('/companies') && url.includes('/users')) return 'Member';
    if (url.includes('/companies')) return 'Company';
    if (url.includes('/users')) return 'User';
    return 'Unknown';
  }

  private extractEntityId(url: string, body: any): string {
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = url.match(uuidRegex);
    if (match) return match[0];
    return body?.id || '00000000-0000-0000-0000-000000000000';
  }

  private sanitizeBody(body: any): any {
    if (!body) return undefined;
    const sanitized = { ...body };
    const sensitiveFields = [
      'password', 'newPassword', 'currentPassword', 'temporaryPassword',
      'token', 'refreshToken', 'accessToken', 'password_hash',
    ];
    for (const field of sensitiveFields) {
      if (sanitized[field]) sanitized[field] = '[REDACTED]';
    }
    return sanitized;
  }
}
