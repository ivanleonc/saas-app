import { Injectable, ForbiddenException } from '@nestjs/common';
import { CompanyRepository } from './repositories/company.repository.js';
// import { AuditLogService } from '../audit/audit-log.service'; // TODO: Migrar

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    // private auditLogger: AuditLogService
  ) {}

  async getUserCompanies(userId: string) {
    return await this.companyRepository.getUserCompanies(userId); //[cite: 12]
  }

  async createCompany(userId: string, name: string, taxId?: string) {
    const newCompany = await this.companyRepository.createWithOwner(userId, name, taxId); //[cite: 12]

    /* TODO: Migrar auditoría[cite: 12]
    this.auditLogger.log({
      companyId: newCompany.id,
      userId: userId,
      action: 'COMPANY_CREATED',
      modelType: 'Company',
      modelId: newCompany.id,
      newValues: { name, tax_id: taxId }
    });
    */

    return newCompany; //[cite: 12]
  }

  async updateCompanyInfo(userId: string, companyId: string, data: { name?: string; tax_id?: string }) {
    const operatorData = await this.companyRepository.verifyUserBelongsToCompany(userId, companyId); //[cite: 12]
    
    if (!operatorData) {
      throw new ForbiddenException('No tienes acceso a esta empresa'); //[cite: 12]
    }
    
    // Verificamos por nombre de rol en lugar de ID estático (más seguro para UUIDs)[cite: 12]
    if (!operatorData.roles.includes('Owner')) {
      throw new ForbiddenException('Operación denegada. Solo el Owner puede modificar la configuración.'); //[cite: 12]
    }

    const updatedCompany = await this.companyRepository.update(companyId, data); //[cite: 12]

    /* TODO: Migrar auditoría[cite: 12]
    this.auditLogger.log({ ... });
    */

    return updatedCompany; //[cite: 12]
  }
}