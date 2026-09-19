import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString, IsIn, IsUUID } from 'class-validator';

export class UpdateMemberDto {
  @ApiPropertyOptional({ description: 'IDs de roles a asignar' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  roleIds?: string[];

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'inactive'], description: 'Estado de la cuenta' })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'], { message: 'El estado debe ser "active" o "inactive"' })
  status?: string;
}
