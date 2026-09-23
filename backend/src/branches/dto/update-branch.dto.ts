import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsBoolean, IsUUID, MaxLength } from 'class-validator';

export class UpdateBranchDto {
  @ApiPropertyOptional({ example: 'Sede Principal (Actualizada)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Nueva dirección 456' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Guadalajara' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Jalisco' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: 'México' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: '44100' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postal_code?: string;

  @ApiPropertyOptional({ example: '+52 33 9876 5432' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'sede.gdl@empresa.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ example: 'BOG-01', description: 'Código corto de la sede' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({ example: true, description: 'Marcar como sede principal (solo una por empresa)' })
  @IsOptional()
  @IsBoolean()
  is_main?: boolean;

  @ApiPropertyOptional({ example: '6f1e2d3c-4b5a-4e4e-8f8f-0a1b2c3d4e5f', description: 'UUID del responsable' })
  @IsOptional()
  @IsUUID()
  manager_user_id?: string;

  @ApiPropertyOptional({ example: 'America/Bogota', description: 'Zona horaria' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;
}
