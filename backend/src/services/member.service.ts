import bcrypt from 'bcrypt';
import { pool } from '@/config/db';
import { UserRepository } from '@/repositories/user.repository';
import { CompanyRepository } from '@/repositories/company.repository';

export class MemberService {
  // Aquí ocurre la Inyección de Dependencias
  constructor(
    private userRepository: UserRepository,
    private companyRepository: CompanyRepository
  ) {}

  // Quitamos la palabra "static"
  async addMemberToCompany(
    operatorId: number, 
    companyId: number, 
    name: string, 
    email: string, 
    roleId: number
  ) {
    // Usamos "this.userRepository" en lugar de "UserRepository"
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado en el sistema');
    }

    const temporaryPassword = 'WelcomeSaaS2026!'; 
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(temporaryPassword, saltRounds);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Usamos "this.userRepository" y "this.companyRepository"
      const newUser = await this.userRepository.createWithClient(client, name, email, passwordHash);
      await this.companyRepository.addMemberWithClient(client, companyId, newUser.id, roleId);

      await client.query('COMMIT');
      
      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        temporary_password: temporaryPassword,
        role_assigned: roleId
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Quitamos la palabra "static"
  async getMembers(operatorId: number, companyId: number) {
    // Reemplazamos por "this.companyRepository"
    const operatorRole = await this.companyRepository.verifyUserBelongsToCompany(operatorId, companyId);
    
    if (!operatorRole) {
      throw new Error('No tienes acceso a esta empresa');
    }

    const members = await this.companyRepository.getCompanyMembers(companyId);
    return members;
  }

  // Actualizar rol o estado
  async updateMember(operatorId: number, companyId: number, targetUserId: number, data: { roleId?: number, status?: string }) {
    // 1. Verificamos que el operador tenga acceso a la empresa
    const operatorRole = await this.companyRepository.verifyUserBelongsToCompany(operatorId, companyId);
    if (!operatorRole) throw new Error('No tienes acceso a esta empresa');

    // Aquí podrías agregar más lógica (ej. solo el Owner puede cambiar roles a Owner)
    
    // 2. Ejecutar actualización
    await this.companyRepository.updateCompanyUser(companyId, targetUserId, data);
  }

  // Eliminar miembro
  async removeMember(operatorId: number, companyId: number, targetUserId: number) {
    const operatorRole = await this.companyRepository.verifyUserBelongsToCompany(operatorId, companyId);
    if (!operatorRole) throw new Error('No tienes acceso a esta empresa');

    if (operatorId === targetUserId) {
      throw new Error('No puedes eliminarte a ti mismo. Usa la opción de abandonar empresa.');
    }

    await this.companyRepository.removeCompanyUser(companyId, targetUserId);
  }
}

// ==========================================
// EXPORTAMOS UNA INSTANCIA ÚNICA (Singleton)
// ==========================================
export const memberService = new MemberService(
  new UserRepository(),
  new CompanyRepository()
);