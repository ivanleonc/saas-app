import { Module, Global } from '@nestjs/common';
import { AuditLogService } from './audit-log.service.js';
import { AuditLogRepository } from './audit-log.repository.js';
import { AuditLogInterceptor } from './audit-log.interceptor.js';

@Global()
@Module({
  providers: [AuditLogService, AuditLogRepository, AuditLogInterceptor],
  exports: [AuditLogService, AuditLogInterceptor],
})
export class AuditLogModule {}
