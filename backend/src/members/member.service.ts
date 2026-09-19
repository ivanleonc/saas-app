import { Injectable } from '@nestjs/common';
import { MemberRepository } from './repositories/member.repository.js';

@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  async getMembers(companyId: string) {
    return this.memberRepository.getMembersByCompany(companyId);
  }

  async addMember(companyId: string, email: string, name: string, roleIds: string[]) {
    return this.memberRepository.addMember(companyId, email, name, roleIds);
  }

  async updateMember(companyId: string, userId: string, data: { roleIds?: string[]; status?: string }) {
    return this.memberRepository.updateMember(companyId, userId, data);
  }

  async removeMember(companyId: string, userId: string) {
    return this.memberRepository.removeMember(companyId, userId);
  }
}
