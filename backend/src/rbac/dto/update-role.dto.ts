import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Gestor de Finanzas', description: 'Nuevo nombre del rol' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'], description: 'UUIDs de permisos a asignar al rol' })
  @IsOptional()
  @IsArray()
  permissionIds?: string[];
}
