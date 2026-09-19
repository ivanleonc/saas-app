import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: any) {
    const companyRoles = payload.companyRoles || {};
    const companyPermissions = payload.companyPermissions || {};

    return {
      id: payload.id,
      must_change_password: payload.must_change_password,
      companies: payload.companies,
      companyRoles,
      companyPermissions,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
    };
  }
}
