import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PermissionRepository } from './repositories/permission.repository.js';
import { RoleRepository } from './repositories/role.repository.js';

@Injectable()
export class RbacService {
  constructor(
    private permissionRepository: PermissionRepository,
    private roleRepository: RoleRepository,
  ) {}

  async getAllPermissions() {
    return this.permissionRepository.findAll();
  }

  async getPermissionsByModule(module: string) {
    return this.permissionRepository.findByModule(module);
  }

  async getRolesWithPermissions(companyId?: string) {
    return this.roleRepository.getRolesWithPermissions(companyId);
  }

  async getRoleById(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException('Rol no encontrado');

    const permissions = await this.roleRepository.getPermissions(id);
    return { ...role, permissions };
  }

  async createRole(name: string, permissionIds: number[], companyId?: string) {
    const existing = await this.roleRepository.findByName(name, companyId);
    if (existing) throw new ConflictException(`El rol "${name}" ya existe`);

    const role = await this.roleRepository.create(name, companyId);

    if (permissionIds.length > 0) {
      await this.roleRepository.setPermissions(role.id, permissionIds);
    }

    return { ...role, permissions: await this.roleRepository.getPermissions(role.id) };
  }

  async updateRolePermissions(roleId: string, permissionIds: number[]) {
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new NotFoundException('Rol no encontrado');

    if (role.name === 'Owner') {
      throw new ConflictException('No se pueden modificar los permisos del rol Owner');
    }

    await this.roleRepository.setPermissions(roleId, permissionIds);
    return { ...role, permissions: await this.roleRepository.getPermissions(roleId) };
  }

  async deleteRole(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException('Rol no encontrado');

    if (role.name === 'Owner' || role.name === 'Admin') {
      throw new ConflictException('No se pueden eliminar los roles del sistema (Owner, Admin)');
    }

    await this.roleRepository.delete(id);
    return { message: `Rol "${role.name}" eliminado correctamente` };
  }

  async getUserPermissions(userId: string, companyId: string) {
    const roles = await this.roleRepository.getUserRolesForCompany(userId, companyId);
    const permissions = await this.roleRepository.getUserPermissions(userId, companyId);

    return {
      roles: roles.map((r: any) => r.name),
      permissions: permissions.map((p: any) => p.code),
    };
  }
}
