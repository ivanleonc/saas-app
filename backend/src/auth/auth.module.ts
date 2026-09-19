import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UserRepository } from './repositories/user.repository.js';
import { RefreshTokenRepository } from './repositories/refresh-token.repository.js';
import { TokenBlacklistRepository } from './repositories/token-blacklist.repository.js';
import { PasswordHistoryRepository } from './repositories/password-history.repository.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { CompanyModule } from '../company/company.module.js';
import { RbacModule } from '../rbac/rbac.module.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    forwardRef(() => CompanyModule),
    RbacModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    RefreshTokenRepository,
    TokenBlacklistRepository,
    PasswordHistoryRepository,
    JwtStrategy,
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
