import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiHeader } from '@nestjs/swagger';
import { MemberService } from './member.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { RequirePermissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Members - Gestión de Miembros')
@ApiBearerAuth()
@Controller('api/companies/users')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Obtener miembros de la empresa', description: 'Requiere permiso users:read' })
  @ApiHeader({ name: 'x-company-id', description: 'UUID de la empresa activa', required: true })
  @ApiResponse({ status: 200, description: 'Lista de miembros con sus roles' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  async getMembers(
    @CurrentUser('id') userId: string,
    @Headers('x-company-id') companyId: string,
  ) {
    const members = await this.memberService.getMembers(companyId);
    return { success: true, data: members };
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:create')
  @ApiOperation({ summary: 'Agregar un miembro a la empresa', description: 'Requiere permiso users:create' })
  @ApiHeader({ name: 'x-company-id', description: 'UUID de la empresa activa', required: true })
  @ApiResponse({ status: 201, description: 'Miembro agregado (incluye contraseña temporal si es nuevo usuario)' })
  @ApiResponse({ status: 409, description: 'El usuario ya es miembro de la empresa' })
  async addMember(
    @CurrentUser('id') userId: string,
    @Headers('x-company-id') companyId: string,
    @Body() dto: AddMemberDto,
  ) {
    const result = await this.memberService.addMember(
      companyId,
      dto.email,
      dto.name,
      dto.roleIds || [],
    );
    return {
      success: true,
      message: result.isNewUser
        ? 'Miembro agregado exitosamente. Se generó una contraseña temporal.'
        : 'Miembro existente agregado a la empresa.',
      data: {
        id: result.id,
        name: result.name,
        email: result.email,
        temporary_password: result.temporary_password,
        role_assigned: result.role_assigned,
      },
    };
  }

  @Patch(':userId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:update')
  @ApiOperation({ summary: 'Actualizar rol o estado de un miembro', description: 'Requiere permiso users:update' })
  @ApiHeader({ name: 'x-company-id', description: 'UUID de la empresa activa', required: true })
  @ApiParam({ name: 'userId', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Miembro actualizado' })
  @ApiResponse({ status: 404, description: 'Miembro no encontrado' })
  async updateMember(
    @CurrentUser('id') userId: string,
    @Headers('x-company-id') companyId: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    const result = await this.memberService.updateMember(companyId, targetUserId, {
      roleIds: dto.roleIds,
      status: dto.status,
    });
    return { success: true, ...result };
  }

  @Delete(':userId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:delete')
  @ApiOperation({ summary: 'Eliminar un miembro de la empresa', description: 'Requiere permiso users:delete' })
  @ApiHeader({ name: 'x-company-id', description: 'UUID de la empresa activa', required: true })
  @ApiParam({ name: 'userId', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Miembro eliminado' })
  @ApiResponse({ status: 404, description: 'Miembro no encontrado' })
  async removeMember(
    @CurrentUser('id') userId: string,
    @Headers('x-company-id') companyId: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
  ) {
    const result = await this.memberService.removeMember(companyId, targetUserId);
    return { success: true, ...result };
  }
}
