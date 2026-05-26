import { CompanyRepository } from '@/repositories/company.repository';

export class CompanyService {
  constructor(private companyRepository: CompanyRepository) {}

  async getUserCompanies(userId: number) {
    const rows = await this.companyRepository.getUserCompanies(userId);
    
    const tenantsMap: Record<number, any> = {};
    rows.forEach((row: any) => {
      if (!tenantsMap[row.id]) {
        tenantsMap[row.id] = {
          id: row.id,
          name: row.name,
          tax_id: row.tax_id,
          role: row.role_name,
          permissions: new Set()
        };
      }
      if (row.permission_name) {
        tenantsMap[row.id].permissions.add(row.permission_name);
      }
    });

    return Object.values(tenantsMap).map((tenant: any) => ({
      ...tenant,
      permissions: Array.from(tenant.permissions)
    }));
  }

  async createCompany(userId: number, name: string, taxId?: string) {
    return await this.companyRepository.createWithOwner(userId, name, taxId);
  }

  // ==========================================
  // NUEVO MÉTODO: Actualizar info de la empresa
  // ==========================================
  async updateCompanyInfo(operatorId: number, companyId: number, data: { name?: string; tax_id?: string }) {
    // 1. Verificamos que el usuario pertenezca a la empresa
    const operatorRole = await this.companyRepository.verifyUserBelongsToCompany(operatorId, companyId);
    
    if (!operatorRole) {
      throw new Error('No tienes acceso a esta empresa');
    }
    
    // 2. Seguridad: Solo el Owner (rol 1) puede editar la empresa
    if (operatorRole.role_id !== 1) {
      throw new Error('Operación denegada. Solo el Owner puede modificar la configuración.');
    }

    // 3. Ejecutamos el guardado en la base de datos
    return await this.companyRepository.update(companyId, data);
  }
}

export const companyService = new CompanyService(new CompanyRepository());