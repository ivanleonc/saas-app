import type { PoolClient } from 'pg';

export interface ICompanyContent {
  id: number;
  name: string;
  tax_id: string | null;
  slug?: string;
  [key: string]: unknown;
}

export interface ICompanyMember {
  id: number;
  name: string;
  email: string;
  status: string;
  roles: string[];
  [key: string]: unknown;
}

export interface ICompanyRepository {
  getUserCompanies(userId: number): Promise<ICompanyContent[]>;
  createWithOwner(userId: number, name: string, taxId?: string): Promise<ICompanyContent>;
  verifyUserBelongsToCompany(userId: number, companyId: number): Promise<{ roles: number[] } | null>;
  getCompanyMembers(companyId: number): Promise<ICompanyMember[]>;
  update(companyId: number, data: { name?: string; tax_id?: string }): Promise<ICompanyContent>;
  addMemberWithClient(client: PoolClient, companyId: number, userId: number, roleIds: number[]): Promise<void>;
  updateCompanyUser(companyId: number, targetUserId: number, data: { roleId?: number, status?: string }): Promise<void>;
  removeCompanyUser(companyId: number, targetUserId: number): Promise<void>;
}