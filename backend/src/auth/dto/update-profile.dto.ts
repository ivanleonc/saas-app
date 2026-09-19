import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Nombre del usuario' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'juan.nuevo@empresa.com', description: 'Nuevo email del usuario' })
  @IsOptional()
  @IsEmail({}, { message: 'El formato del email es inválido' })
  email?: string;
}
