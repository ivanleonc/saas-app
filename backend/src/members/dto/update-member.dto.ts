import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsNumber, IsString, IsIn } from 'class-validator';

export class UpdateMemberDto {
  @ApiPropertyOptional({ example: [2, 3], description: 'IDs de roles a asignar' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  roleIds?: number[];

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'inactive'], description: 'Estado de la cuenta' })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'], { message: 'El estado debe ser "active" o "inactive"' })
  status?: string;
}
