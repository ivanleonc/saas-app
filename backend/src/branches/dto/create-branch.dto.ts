import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Sede Principal', description: 'Nombre de la sede' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Av. Principal 123', description: 'Dirección de la sede' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Ciudad de México', description: 'Ciudad' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'CDMX', description: 'Estado o provincia' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: 'México', description: 'País' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: '06600', description: 'Código postal' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postal_code?: string;

  @ApiPropertyOptional({ example: '+52 55 1234 5678', description: 'Teléfono de contacto' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'sede@empresa.com', description: 'Email de la sede' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;
}
