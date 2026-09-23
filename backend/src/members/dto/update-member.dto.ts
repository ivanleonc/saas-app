import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString, IsIn, IsUUID, MaxLength } from 'class-validator';

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

  @ApiPropertyOptional({ example: '+57 300 123 4567', description: 'Teléfono de contacto' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'Vendedor', description: 'Cargo en la empresa' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({ example: 'CC', description: 'Tipo de documento' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  document_type?: string;

  @ApiPropertyOptional({ example: '1234567890', description: 'Número de documento' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  document_number?: string;
}
