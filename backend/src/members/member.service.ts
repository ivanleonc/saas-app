import { Injectable } from '@nestjs/common';
import { MemberRepository } from './repositories/member.repository.js';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const TEMP_PASSWORD_LENGTH = 12;

@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  async getMembers(companyId: string) {
    return this.memberRepository.getMembersByCompany(companyId);
  }

  async addMember(companyId: string, email: string, name: string, roleIds: string[]) {
    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

    const result = await this.memberRepository.addMember(
      companyId, email, name, roleIds, passwordHash,
    );

    return {
      ...result,
      temporary_password: result.isNewUser ? tempPassword : undefined,
    };
  }

  async updateMember(companyId: string, userId: string, data: { roleIds?: string[]; status?: string }) {
    return this.memberRepository.updateMember(companyId, userId, data);
  }

  async removeMember(companyId: string, userId: string) {
    return this.memberRepository.removeMember(companyId, userId);
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
