import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditRetentionService {
  private readonly logger = new Logger(AuditRetentionService.name);
  private readonly RETENTION_DAYS = 365;
  private readonly CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

  constructor(private dataSource: DataSource) {}

  onModuleInit() {
    this.logger.log(`Audit retention: logs older than ${this.RETENTION_DAYS} days will be cleaned`);
    setTimeout(() => {
      this.runCleanup().catch((error) => {
        this.logger.warn(`Initial retention cleanup skipped: ${error.message}`);
      });
    }, 60 * 60 * 1000);
    setInterval(() => {
      this.runCleanup().catch((error) => {
        this.logger.warn(`Scheduled retention cleanup failed: ${error.message}`);
      });
    }, this.CHECK_INTERVAL_MS);
  }

  async runCleanup() {
    const partitions = [
      'audit_logs_y2026h2',
      'audit_logs_y2027',
      'audit_logs_default',
    ];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.RETENTION_DAYS);
    const cutoffStr = cutoff.toISOString();

    let totalDeleted = 0;
    for (const partitionName of partitions) {
      try {
        const result = await this.dataSource.query(
          `DELETE FROM ${partitionName} WHERE created_at < $1`,
          [cutoffStr]
        );
        const count = result.rowCount || 0;
        if (count > 0) {
          totalDeleted += count;
          this.logger.log(`Retention: deleted ${count} rows from ${partitionName}`);
        }
      } catch {
        // Partition might not exist yet, skip silently
      }
    }

    if (totalDeleted > 0) {
      this.logger.log(`Retention cleanup complete: ${totalDeleted} total rows deleted`);
    }
  }
}
