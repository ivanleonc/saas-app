import { Controller, Post, Get, Put, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { LogoutDto } from './dto/logout.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { SkipPasswordChanged } from './decorators/skip-password-changed.decorator.js';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: { id: 'uuid', email: 'nuevo@empresa.com', name: 'Juan Pérez', must_change_password: false },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El correo ya está registrado' })
  async register(@Body() registerDto: RegisterDto) {
    const { message, accessToken, refreshToken, user } = await this.authService.register(registerDto.email, registerDto.password, registerDto.name);
    return { success: true, message, data: { accessToken, refreshToken, user } };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Retorna accessToken (15min) y refreshToken (7d). Si la cuenta está bloqueada por intentos fallidos, retorna error con tiempo restante.' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        success: true,
        message: 'Login exitoso',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIs...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
          user: {
            id: 'uuid',
            email: 'usuario@empresa.com',
            name: 'Juan Pérez',
            must_change_password: false,
            email_verified: true,
            password_expired: false,
            tenants: [{ id: 'company-uuid', name: 'Mi Empresa', roles: ['Owner'] }],
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 403, description: 'Cuenta bloqueada temporalmente por intentos fallidos' })
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const { message, ...data } = await this.authService.login(
      loginDto.email,
      loginDto.password,
      req.ip,
      req.headers['user-agent'],
    );
    return { success: true, message, data };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar tokens', description: 'Intercambia un refreshToken válido por un nuevo par de tokens (accessToken + refreshToken). El refreshToken anterior se revoca.' })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIs...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const data = await this.authService.refresh(refreshTokenDto.refreshToken);
    return { success: true, data };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión', description: 'Invalida el accessToken actual (agrega a blacklist) y opcionalmente un refreshToken específico.' })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada',
    schema: {
      example: {
        success: true,
        message: 'Sesión cerrada correctamente',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido' })
  async logout(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Body() logoutDto: LogoutDto,
  ) {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.replace('Bearer ', '');
    const result = await this.authService.logout(userId, accessToken, logoutDto.refreshToken);
    return { success: true, ...result };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario con sus empresas',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          email: 'usuario@empresa.com',
          name: 'Juan Pérez',
          must_change_password: false,
          email_verified: true,
          password_expired: false,
          tenants: [{ id: 'company-uuid', name: 'Mi Empresa', roles: ['Owner'] }],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido' })
  async getProfile(@CurrentUser('id') userId: string) {
    const data = await this.authService.getProfile(userId);
    return { success: true, data };
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil del usuario', description: 'Permite cambiar nombre y email. El email debe ser único.' })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado',
    schema: { example: { success: true, message: 'Perfil actualizado correctamente' } },
  })
  @ApiResponse({ status: 409, description: 'El email ya está en uso' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const result = await this.authService.updateProfile(userId, dto);
    return { success: true, ...result };
  }

  @SkipPasswordChanged()
  @Post('change-temporary-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña temporal (onboarding)' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada',
    schema: { example: { success: true, message: 'Contraseña actualizada correctamente. Ya puedes acceder al sistema.' } },
  })
  @ApiResponse({ status: 400, description: 'Contraseña < 6 caracteres' })
  @ApiResponse({ status: 401, description: 'Token JWT inválido' })
  @ApiResponse({ status: 403, description: 'No puedes reusar contraseñas recientes' })
  async changeTemporaryPassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const result = await this.authService.changeTemporaryPassword(userId, changePasswordDto.newPassword);
    return { success: true, ...result };
  }

  @SkipPasswordChanged()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña (usuario autenticado)', description: 'Requiere la contraseña actual. No permite reusar las últimas 3 contraseñas.' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada',
    schema: { example: { success: true, message: 'Contraseña actualizada correctamente.' } },
  })
  @ApiResponse({ status: 401, description: 'Contraseña actual incorrecta o token inválido' })
  @ApiResponse({ status: 403, description: 'No puedes reusar contraseñas recientes' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const result = await this.authService.changePassword(userId, body.currentPassword, body.newPassword);
    return { success: true, ...result };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña', description: 'Envía un email con token de recuperación (15min). Respuesta genérica por seguridad.' })
  @ApiResponse({
    status: 200,
    description: 'Instrucciones enviadas',
    schema: { example: { success: true, message: 'Si el correo existe, se han enviado las instrucciones.' } },
  })
  @ApiResponse({ status: 400, description: 'Email con formato inválido' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.requestPasswordReset(forgotPasswordDto.email);
    return { success: true, ...result };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con token', description: 'El token se invalida al usarlo. Se revocan todos los refresh tokens del usuario.' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida',
    schema: { example: { success: true, message: 'Contraseña recuperada y actualizada correctamente.' } },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    return { success: true, ...result };
  }
}
