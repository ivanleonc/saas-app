import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompanyService } from './company.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PasswordChangedGuard } from '../auth/guards/password-changed.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PasswordChangedGuard)
@Controller('api/companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener empresas del usuario autenticado', description: 'Retorna la lista de empresas a las que pertenece el usuario, incluyendo sus roles (Owner, Admin, etc.)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de empresas del usuario',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'company-uuid-1',
            name: 'Mi Empresa S.A.',
            tax_id: '12345678-9',
            roles: ['Owner'],
          },
          {
            id: 'company-uuid-2',
            name: 'Otra Empresa Ltda.',
            tax_id: '98765432-1',
            roles: ['Admin'],
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  async getUserCompanies(@CurrentUser('id') userId: string) {
    const companies = await this.companyService.getUserCompanies(userId);
    return { success: true, data: companies };
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva empresa', description: 'El usuario autenticado se convierte automáticamente en Owner de la empresa creada' })
  @ApiResponse({
    status: 201,
    description: 'Empresa creada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Empresa creada exitosamente',
        data: {
          company: {
            id: 'company-uuid-3',
            name: 'Nueva Empresa SpA',
            tax_id: '11223344-5',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos (nombre requerido, mínimo 2 caracteres)' })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  async createCompany(
    @CurrentUser('id') userId: string,
    @Body() createCompanyDto: CreateCompanyDto,
  ) {
    const newCompany = await this.companyService.createCompany(
      userId,
      createCompanyDto.name,
      createCompanyDto.tax_id,
    );
    return { success: true, message: 'Empresa creada exitosamente', data: { company: newCompany } };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar información de empresa', description: 'Solo el rol Owner puede modificar los datos de la empresa' })
  @ApiParam({ name: 'id', description: 'UUID de la empresa', example: 'company-uuid-1' })
  @ApiResponse({
    status: 200,
    description: 'Empresa actualizada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Empresa actualizada exitosamente',
        data: {
          company: {
            id: 'company-uuid-1',
            name: 'Mi Empresa S.A. (editada)',
            tax_id: '12345678-9',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o empresa no encontrada' })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a esta empresa o no eres Owner' })
  async updateCompany(
    @CurrentUser('id') userId: string,
    @Param('id') companyId: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    const updatedCompany = await this.companyService.updateCompanyInfo(userId, companyId, updateCompanyDto);
    return { success: true, message: 'Empresa actualizada exitosamente', data: { company: updatedCompany } };
  }
}
