import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from './audit-log.service.js';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;
    const userAgent = headers['user-agent'];

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const action = `${method} ${this.normalizeUrl(url)}`;

        this.auditLogService.log({
          userId: user?.id,
          companyId: user?.companies?.[0],
          action,
          entityType: this.extractEntityType(url),
          entityId: this.extractEntityId(url, body),
          newValues: method !== 'GET' ? this.sanitizeBody(body) : undefined,
          ipAddress: ip,
          userAgent,
        }).catch(() => {});

        this.logger.debug(`${action} ${duration}ms`);
      }),
    );
  }

  private normalizeUrl(url: string): string {
    return url.replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      ':id',
    );
  }

  private extractEntityType(url: string): string {
    if (url.includes('/auth')) return 'Auth';
    if (url.includes('/companies')) return 'Company';
    if (url.includes('/roles')) return 'Role';
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
    const sensitiveFields = ['password', 'newPassword', 'token', 'password_hash', 'currentPassword'];
    for (const field of sensitiveFields) {
      if (sanitized[field]) sanitized[field] = '[REDACTED]';
    }
    return sanitized;
  }
}
