import { Module } from '@nestjs/common';
import { MemberController } from './member.controller.js';
import { MemberService } from './member.service.js';
import { MemberRepository } from './repositories/member.repository.js';
import { RbacModule } from '../rbac/rbac.module.js';

@Module({
  imports: [RbacModule],
  controllers: [MemberController],
  providers: [MemberService, MemberRepository],
  exports: [MemberService],
})
export class MemberModule {}
