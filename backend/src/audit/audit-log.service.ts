import { Injectable, Logger } from '@nestjs/common';
import { AuditLogRepository } from './audit-log.repository.js';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private auditLogRepository: AuditLogRepository) {}

  async log(data: {
    userId?: string;
    companyId?: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    if (!data.companyId) {
      this.logger.debug(`Skipping audit log for action "${data.action}" — no companyId provided`);
      return;
    }

    try {
      await this.auditLogRepository.log({
        ...data,
        companyId: data.companyId,
      });
    } catch (error: any) {
      this.logger.error(`Failed to write audit log: ${error.message}`);
    }
  }

  async findByUser(userId: string, limit?: number) {
    return this.auditLogRepository.findByUser(userId, limit);
  }

  async findByCompany(companyId: string, limit?: number) {
    return this.auditLogRepository.findByCompany(companyId, limit);
  }
}
