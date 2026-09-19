import { Module, forwardRef } from '@nestjs/common';
import { RbacController } from './rbac.controller.js';
import { RbacService } from './rbac.service.js';
import { PermissionRepository } from './repositories/permission.repository.js';
import { RoleRepository } from './repositories/role.repository.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    forwardRef(() => AuthModule),
  ],
  controllers: [RbacController],
  providers: [RbacService, PermissionRepository, RoleRepository],
  exports: [RbacService, RoleRepository],
})
export class RbacModule {}
