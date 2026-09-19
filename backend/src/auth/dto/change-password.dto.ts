import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'NuevaPassword456!', description: 'Nueva contraseña segura (mínimo 6 caracteres)' })
  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword: string;
}
