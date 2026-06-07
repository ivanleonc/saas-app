import { CompanyRepository } from '@/repositories/company.repository';
import type { ICompanyRepository } from '@/repositories/interfaces/company.repository.interface';
import { AuditLogService, auditLogService } from '@/services/audit-log.service';

export class CompanyService {
  constructor(
    private companyRepository: ICompanyRepository,
    private auditLogger: AuditLogService
  ) {}

  async getUserCompanies(userId: number) {
    // Retornamos directamente lo que viene de la base de datos
    return await this.companyRepository.getUserCompanies(userId);
  }

  async createCompany(userId: number, name: string, taxId?: string) {
    const newCompany = await this.companyRepository.createWithOwner(userId, name, taxId);

    this.auditLogger.log({
      companyId: newCompany.id,
      userId: userId,
      action: 'COMPANY_CREATED',
      modelType: 'Company',
      modelId: newCompany.id,
      newValues: { name, tax_id: taxId }
    });

    return newCompany;
  }

async updateCompanyInfo(operatorId: number, companyId: number, data: { name?: string; tax_id?: string }) {
    const operatorData = await this.companyRepository.verifyUserBelongsToCompany(operatorId, companyId);
    
    if (!operatorData) {
      throw new Error('No tienes acceso a esta empresa');
    }
    
    // NUEVA VALIDACIÓN: Verificamos si entre sus múltiples roles incluye el ID 1 (Owner)
    if (!operatorData.roles.includes(1)) {
      throw new Error('Operación denegada. Solo el Owner puede modificar la configuración.');
    }

    const updatedCompany = await this.companyRepository.update(companyId, data);

    this.auditLogger.log({
      companyId: companyId,
      userId: operatorId,
      action: 'COMPANY_UPDATED',
      modelType: 'Company',
      modelId: companyId,
      newValues: data
    });

    return updatedCompany;
  }
}

export const companyService = new CompanyService(
  new CompanyRepository(),
  auditLogService
);