import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'nuevo@empresa.com', description: 'Email del nuevo usuario' })
  @IsEmail({}, { message: 'El formato del email es inválido' })
  email: string;

  @ApiProperty({ example: 'Segura123!', description: 'Contraseña (mínimo 6 caracteres)' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Nombre completo del usuario' })
  @IsOptional()
  @IsString()
  name?: string;
}
