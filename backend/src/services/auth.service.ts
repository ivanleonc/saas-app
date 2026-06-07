import bcrypt from 'bcrypt';
import { generateToken, generateResetToken, verifyResetToken } from '@/utils/jwt';
import { UserRepository } from '@/repositories/user.repository';
import { CompanyRepository } from '@/repositories/company.repository';
import type { IUserRepository } from '@/repositories/interfaces/user.repository.interface';
import type { ICompanyRepository } from '@/repositories/interfaces/company.repository.interface';
import { AuditLogService, auditLogService } from '@/services/audit-log.service';
import { EmailService, emailService } from '@/services/email.service';

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private companyRepository: ICompanyRepository,
    private auditLogger: AuditLogService,
    private emailQueue: EmailService
  ) {}

  async register(name: string, email: string, passwordPlain: string) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);

    const newUser = await this.userRepository.create(name, email, passwordHash);

    await this.companyRepository.createWithOwner(newUser.id, `Empresa de ${name}`);

    // ¡Mucho más limpio! El repositorio ya nos da todo armado.
    const tenants = await this.companyRepository.getUserCompanies(newUser.id);
    const companyIds = tenants.map((t: any) => t.id);

    const token = generateToken({ 
      id: newUser.id, 
      is_super_admin: newUser.is_super_admin,
      companies: companyIds 
    });

    this.auditLogger.log({
      companyId: null,
      userId: newUser.id,
      action: 'USER_REGISTERED',
      modelType: 'User',
      modelId: newUser.id,
      newValues: { email: newUser.email, name: newUser.name }
    });

    return {
      message: 'Registro exitoso',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        is_super_admin: newUser.is_super_admin,
        tenants
      }
    };
  }

  async login(email: string, passwordPlain: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    const isPasswordValid = await bcrypt.compare(passwordPlain, user.password_hash);
    if (!isPasswordValid) throw new Error('Credenciales inválidas');

    // ¡Mucho más limpio! El repositorio ya nos da todo armado.
    const tenants = await this.companyRepository.getUserCompanies(user.id);
    const companyIds = tenants.map((t: any) => t.id);

    const token = generateToken({ 
      id: user.id, 
      is_super_admin: user.is_super_admin,
      companies: companyIds 
    });

    this.auditLogger.log({
      companyId: null,
      userId: user.id,
      action: 'USER_LOGIN',
      modelType: 'User',
      modelId: user.id
    });

    return {
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_super_admin: user.is_super_admin,
        tenants
      }
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Como medida anti-enumeración, no lanzamos un error revelador si el email no existe, 
      // solo fingimos que se envió.
      return { message: 'Si el correo existe, se han enviado las instrucciones.' };
    }

    const resetToken = generateResetToken(user.id, user.password_hash);
    
    // Disparar correo asíncrono
    this.emailQueue.sendPasswordResetEmail(user.email, resetToken);
    
    this.auditLogger.log({
      companyId: null,
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      modelType: 'User',
      modelId: user.id
    });

    return { message: 'Si el correo existe, se han enviado las instrucciones.' };
  }

  async resetPassword(email: string, token: string, newPasswordPlain: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Token inválido o expirado.');

    // Validar el token usando el hash de la contraseña antigua como secreto
    const decoded = verifyResetToken(token, user.password_hash);
    if (!decoded || decoded.id !== user.id) {
      throw new Error('Token inválido o expirado.');
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPasswordPlain, saltRounds);

    await this.userRepository.updatePassword(user.id, newPasswordHash);

    this.auditLogger.log({
      companyId: null,
      userId: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      modelType: 'User',
      modelId: user.id
    });

    return { message: 'Contraseña actualizada correctamente.' };
  }
}

export const authService = new AuthService(
  new UserRepository(),
  new CompanyRepository(),
  auditLogService,
  emailService
);