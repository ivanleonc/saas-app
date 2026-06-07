import { CompanyRepository } from '@/repositories/company.repository';
import type { ICompanyRepository } from '@/repositories/interfaces/company.repository.interface';

export class CompanyService {
  constructor(private companyRepository: ICompanyRepository) {}

  async getUserCompanies(userId: number) {
    // Retornamos directamente lo que viene de la base de datos
    return await this.companyRepository.getUserCompanies(userId);
  }

  async createCompany(userId: number, name: string, taxId?: string) {
    return await this.companyRepository.createWithOwner(userId, name, taxId);
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

    return await this.companyRepository.update(companyId, data);
  }
}

export const companyService = new CompanyService(new CompanyRepository());