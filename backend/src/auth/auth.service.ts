import { Injectable } from '@nestjs/common';
import { RegistrationService } from './registration.service.js';
import { SessionService } from './session.service.js';
import { PasswordService } from './password.service.js';

@Injectable()
export class AuthService {
  constructor(
    private registrationService: RegistrationService,
    private sessionService: SessionService,
    private passwordService: PasswordService,
  ) {}

  register(email: string, passwordPlain: string, name?: string) {
    return this.registrationService.register(email, passwordPlain, name);
  }

  login(email: string, passwordPlain: string, ip?: string, userAgent?: string) {
    return this.sessionService.login(email, passwordPlain, ip, userAgent);
  }

  refresh(refreshToken: string) {
    return this.sessionService.refresh(refreshToken);
  }

  logout(userId: string, accessToken: string, refreshToken?: string) {
    return this.sessionService.logout(userId, accessToken, refreshToken);
  }

  getProfile(userId: string) {
    return this.sessionService.getProfile(userId);
  }

  updateProfile(userId: string, data: { name?: string; email?: string }) {
    return this.sessionService.updateProfile(userId, data);
  }

  changeTemporaryPassword(userId: string, newPasswordPlain: string) {
    return this.passwordService.changeTemporaryPassword(userId, newPasswordPlain);
  }

  changePassword(userId: string, currentPassword: string, newPasswordPlain: string) {
    return this.passwordService.changePassword(userId, currentPassword, newPasswordPlain);
  }

  requestPasswordReset(email: string) {
    return this.passwordService.requestPasswordReset(email);
  }

  resetPassword(email: string, token: string, newPasswordPlain: string) {
    return this.passwordService.resetPassword(email, token, newPasswordPlain);
  }
}
