import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsNumber } from 'class-validator';

export class UpdateRolePermissionsDto {
  @ApiPropertyOptional({ example: [1, 2, 5, 7], description: 'IDs completos de permisos para el rol' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds?: number[];
}
