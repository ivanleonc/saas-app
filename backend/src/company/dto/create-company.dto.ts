import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Mi Empresa S.A.', description: 'Nombre de la empresa (mínimo 2 caracteres)' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @ApiPropertyOptional({ example: '12345678-9', description: 'RUT o identificador fiscal (opcional)' })
  @IsOptional()
  @IsString()
  tax_id?: string;
}
