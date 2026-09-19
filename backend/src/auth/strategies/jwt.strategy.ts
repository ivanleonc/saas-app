import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret',
    });
  }

  async validate(payload: any) {
    // Base user info from JWT
    const baseUser = {
      id: payload.id,
      must_change_password: payload.must_change_password,
      companies: payload.companies,
    };

    // Try to get the current company from headers (set by frontend interceptor)
    // Note: We can't access headers directly in passport strategy validate,
    // so we store all company roles/permissions in the JWT and resolve per-request via guard
    const companyRoles = payload.companyRoles || {};
    const companyPermissions = payload.companyPermissions || {};

    return {
      ...baseUser,
      companyRoles,
      companyPermissions,
      // Flat defaults (for backwards compatibility)
      roles: payload.roles || [],
      permissions: payload.permissions || [],
    };
  }
}
