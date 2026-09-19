import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiHeader } from '@nestjs/swagger';
import { RbacService } from './rbac.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@ApiTags('RBAC - Roles & Permissions')
@ApiBearerAuth()
@Controller('api')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('permissions')
  @ApiOperation({ summary: 'Obtener catálogo maestro de permisos' })
  @ApiResponse({ status: 200, description: 'Lista de todos los permisos del sistema' })
  async getAllPermissions() {
    const permissions = await this.rbacService.getAllPermissions();
    return { success: true, data: permissions };
  }

  @Get('roles')
  @ApiOperation({ summary: 'Obtener roles con sus permisos' })
  @ApiHeader({ name: 'x-company-id', description: 'UUID de la empresa (opcional, para filtrar)', required: false })
  @ApiResponse({ status: 200, description: 'Lista de roles con permisos anidados' })
  async getRoles(@Headers('x-company-id') companyId?: string) {
    const roles = await this.rbacService.getRolesWithPermissions(companyId);
    return { success: true, data: roles };
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Obtener un rol por ID con sus permisos' })
  @ApiParam({ name: 'id', description: 'UUID del rol' })
  @ApiResponse({ status: 200, description: 'Rol con permisos' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async getRoleById(@Param('id', ParseUUIDPipe) id: string) {
    const role = await this.rbacService.getRoleById(id);
    return { success: true, data: role };
  }

  @Post('roles')
  @UseGuards(RolesGuard)
  @Roles('Owner', 'Admin')
  @ApiOperation({ summary: 'Crear un rol personalizado' })
  @ApiHeader({ name: 'x-company-id', description: 'UUID de la empresa (opcional)' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  @ApiResponse({ status: 409, description: 'Ya existe un rol con ese nombre' })
  async createRole(
    @Body() dto: CreateRoleDto,
    @Headers('x-company-id') companyId?: string,
  ) {
    const role = await this.rbacService.createRole(dto.name, dto.permissionIds || [], companyId);
    return { success: true, message: 'Rol creado exitosamente', data: role };
  }

  @Put('roles/:id/permissions')
  @UseGuards(RolesGuard)
  @Roles('Owner')
  @ApiOperation({ summary: 'Actualizar permisos de un rol', description: 'Solo el Owner puede modificar permisos' })
  @ApiParam({ name: 'id', description: 'UUID del rol' })
  @ApiResponse({ status: 200, description: 'Permisos actualizados' })
  @ApiResponse({ status: 403, description: 'Solo el Owner puede modificar permisos' })
  async updateRolePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    const role = await this.rbacService.updateRolePermissions(id, dto.permissionIds || []);
    return { success: true, message: 'Permisos actualizados correctamente', data: role };
  }

  @Delete('roles/:id')
  @UseGuards(RolesGuard)
  @Roles('Owner')
  @ApiOperation({ summary: 'Eliminar un rol personalizado', description: 'No se pueden eliminar Owner ni Admin' })
  @ApiParam({ name: 'id', description: 'UUID del rol' })
  @ApiResponse({ status: 200, description: 'Rol eliminado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar un rol del sistema' })
  async deleteRole(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.rbacService.deleteRole(id);
    return { success: true, ...result };
  }
}
