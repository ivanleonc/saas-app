import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsArray, IsOptional, IsUUID } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del miembro' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'juan@empresa.com', description: 'Email del miembro' })
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El formato del email es inválido' })
  email: string;

  @ApiPropertyOptional({ description: 'IDs de roles a asignar (si se omite, se asigna Admin por defecto)' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  roleIds?: string[];
}
