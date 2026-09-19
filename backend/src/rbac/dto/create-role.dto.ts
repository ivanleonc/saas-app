import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Gestor de Finanzas', description: 'Nombre del rol' })
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Acceso solo a reportes financieros', description: 'Descripción del rol' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: [1, 2, 3], description: 'IDs de permisos a asignar al rol' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds?: number[];
}
