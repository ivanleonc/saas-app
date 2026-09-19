import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './repositories/user.repository.js';
import { RefreshTokenRepository } from './repositories/refresh-token.repository.js';
import { TokenBlacklistRepository } from './repositories/token-blacklist.repository.js';
import { PasswordHistoryRepository } from './repositories/password-history.repository.js';
import { CompanyService } from '../company/company.service.js';
import { AuditLogService } from '../audit/audit-log.service.js';
import { EmailService } from '../email/email.service.js';
import { RbacService } from '../rbac/rbac.service.js';

const SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const PASSWORD_HISTORY_LIMIT = 3;
const PASSWORD_MAX_AGE_DAYS = 90;

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokenRepository: RefreshTokenRepository,
    private tokenBlacklistRepository: TokenBlacklistRepository,
    private passwordHistoryRepository: PasswordHistoryRepository,
    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,
    private auditLogService: AuditLogService,
    private emailService: EmailService,
    private rbacService: RbacService,
  ) {}

  private get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'fallback_secret';
  }

  private async buildCompanyRolesAndPermissions(userId: string, tenants: any[]) {
    const companyRoles: Record<string, string[]> = {};
    const companyPermissions: Record<string, string[]> = {};

    for (const tenant of tenants) {
      const result = await this.rbacService.getUserPermissions(userId, tenant.id);
      companyRoles[tenant.id] = result.roles;
      companyPermissions[tenant.id] = result.permissions;
    }

    return { companyRoles, companyPermissions };
  }

  private async generateTokenPair(userId: string, payload: Record<string, any>) {
    const accessToken = this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRY });

    const refreshPayload = { sub: userId, type: 'refresh' };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    await this.refreshTokenRepository.create(userId, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }

  private async checkAccountLock(user: any) {
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingMs = new Date(user.locked_until).getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw new ForbiddenException(`Cuenta bloqueada temporalmente. Intenta de nuevo en ${remainingMin} minuto(s).`);
    }
  }

  private async checkPasswordHistory(userId: string, newPasswordHash: string): Promise<void> {
    const recentHashes = await this.passwordHistoryRepository.getRecent(userId, PASSWORD_HISTORY_LIMIT);
    for (const oldHash of recentHashes) {
      if (await bcrypt.compare(newPasswordHash, oldHash)) {
        throw new ForbiddenException(`No puedes usar una de las últimas ${PASSWORD_HISTORY_LIMIT} contraseñas.`);
      }
    }
  }

  private async checkPasswordExpiry(user: any): Promise<boolean> {
    if (!user.password_changed_at) return false;
    const changedAt = new Date(user.password_changed_at);
    const maxAge = PASSWORD_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    return (Date.now() - changedAt.getTime()) > maxAge;
  }

  private async savePasswordHistory(userId: string, passwordHash: string) {
    await this.passwordHistoryRepository.add(userId, passwordHash);
    await this.passwordHistoryRepository.cleanup(userId);
  }

  private async getFirstCompanyId(userId: string): Promise<string | undefined> {
    const tenants = await this.companyService.getUserCompanies(userId);
    return tenants[0]?.id;
  }

  async register(email: string, passwordPlain: string, name?: string) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const passwordHash = await bcrypt.hash(passwordPlain, SALT_ROUNDS);
    const newUser = await this.userRepository.create(email, passwordHash, name);

    return {
      message: 'Usuario registrado exitosamente',
      user: newUser,
    };
  }

  async login(email: string, passwordPlain: string, ip?: string, userAgent?: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    await this.checkAccountLock(user);

    const isPasswordValid = await bcrypt.compare(passwordPlain, user.password_hash);
    if (!isPasswordValid) {
      await this.userRepository.incrementFailedLoginAttempts(user.id);

      const updatedUser = await this.userRepository.findByEmail(email);
      if (updatedUser.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
        await this.userRepository.lockAccount(user.id, LOCK_MINUTES);
        const companyId = await this.getFirstCompanyId(user.id);
        if (companyId) {
          await this.auditLogService.log({
            userId: user.id,
            companyId,
            action: 'ACCOUNT_LOCKED',
            entityType: 'User',
            entityId: user.id,
            newValues: { reason: 'Max failed attempts', lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60000) },
            ipAddress: ip,
            userAgent,
          });
        }
      }

      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.userRepository.resetFailedLoginAttempts(user.id);

    const tenants = await this.companyService.getUserCompanies(user.id);
    const companyIds = tenants.map((t: any) => t.id);

    // Build per-company roles and permissions
    const { companyRoles, companyPermissions } = await this.buildCompanyRolesAndPermissions(user.id, tenants);

    // Flatten for first company (default)
    const firstCompanyId = companyIds[0];
    const defaultRoles = firstCompanyId ? (companyRoles[firstCompanyId] || []) : [];
    const defaultPermissions = firstCompanyId ? (companyPermissions[firstCompanyId] || []) : [];

    const { accessToken, refreshToken } = await this.generateTokenPair(user.id, {
      id: user.id,
      must_change_password: user.must_change_password,
      companies: companyIds,
      companyRoles,
      companyPermissions,
      roles: defaultRoles,
      permissions: defaultPermissions,
    });

    const passwordExpired = await this.checkPasswordExpiry(user);

    const companyId = companyIds[0];
    if (companyId) {
      await this.auditLogService.log({
        userId: user.id,
        companyId,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user.id,
        ipAddress: ip,
        userAgent,
      });
    }

    return {
      message: 'Login exitoso',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        must_change_password: user.must_change_password,
        email_verified: user.email_verified,
        password_expired: passwordExpired,
        tenants,
        roles: defaultRoles,
        permissions: defaultPermissions,
      },
    };
  }

  async refresh(refreshToken: string) {
    let decoded: any;
    try {
      decoded = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('Token inválido');
    }

    const storedToken = await this.refreshTokenRepository.findValid(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedException('Refresh token inválido o revocado');
    }

    await this.refreshTokenRepository.revoke(refreshToken);

    const user = await this.userRepository.findById(decoded.sub);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const tenants = await this.companyService.getUserCompanies(user.id);
    const companyIds = tenants.map((t: any) => t.id);

    const { companyRoles, companyPermissions } = await this.buildCompanyRolesAndPermissions(user.id, tenants);

    const firstCompanyId = companyIds[0];
    const defaultRoles = firstCompanyId ? (companyRoles[firstCompanyId] || []) : [];
    const defaultPermissions = firstCompanyId ? (companyPermissions[firstCompanyId] || []) : [];

    const tokens = await this.generateTokenPair(user.id, {
      id: user.id,
      must_change_password: user.must_change_password,
      companies: companyIds,
      companyRoles,
      companyPermissions,
      roles: defaultRoles,
      permissions: defaultPermissions,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string, accessToken: string, refreshToken?: string) {
    let decoded: any;
    try {
      decoded = this.jwtService.decode(accessToken);
      if (decoded?.exp) {
        await this.tokenBlacklistRepository.add(accessToken, new Date(decoded.exp * 1000));
      }
    } catch {}

    if (refreshToken) {
      await this.refreshTokenRepository.revoke(refreshToken);
    }

    const companyId = await this.getFirstCompanyId(userId);
    if (companyId) {
      await this.auditLogService.log({
        userId,
        companyId,
        action: 'USER_LOGOUT',
        entityType: 'User',
        entityId: userId,
      });
    }

    return { message: 'Sesión cerrada correctamente' };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const tenants = await this.companyService.getUserCompanies(userId);
    const passwordExpired = await this.checkPasswordExpiry(user);

    // Get roles/permissions for first company
    const firstCompanyId = tenants[0]?.id;
    let roles: string[] = [];
    let permissions: string[] = [];

    if (firstCompanyId) {
      const result = await this.rbacService.getUserPermissions(userId, firstCompanyId);
      roles = result.roles;
      permissions = result.permissions;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      must_change_password: user.must_change_password,
      email_verified: user.email_verified,
      password_expired: passwordExpired,
      tenants,
      roles,
      permissions,
    };
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    // Check if email is already taken by another user
    if (data.email && data.email !== user.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing) {
        throw new ConflictException('El correo electrónico ya está en uso');
      }
    }

    await this.userRepository.updateProfile(userId, data);

    const companyId = await this.getFirstCompanyId(userId);
    if (companyId) {
      await this.auditLogService.log({
        userId,
        companyId,
        action: 'PROFILE_UPDATED',
        entityType: 'User',
        entityId: userId,
        oldValues: { name: user.name, email: user.email },
        newValues: data,
      });
    }

    return { message: 'Perfil actualizado correctamente' };
  }

  async changeTemporaryPassword(userId: string, newPasswordPlain: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const newPasswordHash = await bcrypt.hash(newPasswordPlain, SALT_ROUNDS);
    await this.checkPasswordHistory(userId, newPasswordHash);
    await this.userRepository.updateTemporaryPassword(userId, newPasswordHash);
    await this.savePasswordHistory(userId, newPasswordHash);

    const companyId = await this.getFirstCompanyId(userId);
    if (companyId) {
      await this.auditLogService.log({
        userId,
        companyId,
        action: 'TEMPORARY_PASSWORD_CHANGED',
        entityType: 'User',
        entityId: userId,
      });
    }

    return { message: 'Contraseña actualizada correctamente. Ya puedes acceder al sistema.' };
  }

  async changePassword(userId: string, currentPassword: string, newPasswordPlain: string) {
    const user = await this.userRepository.findByEmail(
      (await this.userRepository.findById(userId))?.email,
    );
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) throw new UnauthorizedException('La contraseña actual es incorrecta');

    const newPasswordHash = await bcrypt.hash(newPasswordPlain, SALT_ROUNDS);
    await this.checkPasswordHistory(userId, newPasswordHash);
    await this.userRepository.updatePassword(userId, newPasswordHash);
    await this.savePasswordHistory(userId, newPasswordHash);

    const companyId = await this.getFirstCompanyId(userId);
    if (companyId) {
      await this.auditLogService.log({
        userId,
        companyId,
        action: 'PASSWORD_CHANGED',
        entityType: 'User',
        entityId: userId,
      });
    }

    return { message: 'Contraseña actualizada correctamente.' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return { message: 'Si el correo existe, se han enviado las instrucciones.' };
    }

    const tempSecret = this.jwtSecret + user.password_hash;
    const resetToken = this.jwtService.sign({ id: user.id }, { secret: tempSecret, expiresIn: '15m' });

    await this.emailService.sendPasswordReset(user.email, resetToken);

    const companyId = await this.getFirstCompanyId(user.id);
    if (companyId) {
      await this.auditLogService.log({
        userId: user.id,
        companyId,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'User',
        entityId: user.id,
      });
    }

    return { message: 'Si el correo existe, se han enviado las instrucciones.' };
  }

  async resetPassword(email: string, token: string, newPasswordPlain: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Token inválido o expirado.');

    const tempSecret = this.jwtSecret + user.password_hash;
    try {
      const decoded = this.jwtService.verify(token, { secret: tempSecret });
      if (decoded.id !== user.id) throw new Error();
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    const newPasswordHash = await bcrypt.hash(newPasswordPlain, SALT_ROUNDS);
    await this.checkPasswordHistory(user.id, newPasswordHash);
    await this.userRepository.updatePassword(user.id, newPasswordHash);
    await this.savePasswordHistory(user.id, newPasswordHash);
    await this.refreshTokenRepository.revokeAllForUser(user.id);

    const companyId = await this.getFirstCompanyId(user.id);
    if (companyId) {
      await this.auditLogService.log({
        userId: user.id,
        companyId,
        action: 'PASSWORD_RESET_COMPLETED',
        entityType: 'User',
        entityId: user.id,
      });
    }

    return { message: 'Contraseña recuperada y actualizada correctamente.' };
  }
}
