import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class PasswordChangedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.must_change_password) {
      throw new ForbiddenException('Debes cambiar tu contraseña temporal antes de continuar.');
    }
    return true;
  }
}