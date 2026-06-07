import type { IAuditLogRepository, IAuditLogData } from '@/repositories/interfaces/audit-log.repository.interface';

export class AuditLogService {
  constructor(private auditLogRepository: IAuditLogRepository) {}

  /**
   * Registra una acción en la pista de auditoría.
   * Se manejan los errores internamente para no interrumpir el flujo principal de la aplicación.
   */
  async log(data: IAuditLogData): Promise<void> {
    try {
      await this.auditLogRepository.createLog(data);
    } catch (error) {
      // Las fallas en auditoría idealmente se reportan a un logger de sistema (Datadog, Sentry), 
      // pero NUNCA deben romper la aplicación del usuario.
      console.error('[Audit Log Error]:', error);
    }
  }
}

// Para proyectos más grandes, se podría extraer a un archivo de Inyección de Dependencias
import { AuditLogRepository } from '@/repositories/audit-log.repository';
export const auditLogService = new AuditLogService(new AuditLogRepository());