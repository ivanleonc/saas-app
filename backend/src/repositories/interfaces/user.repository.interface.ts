import type { PoolClient } from 'pg';

export interface IUserContent {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  is_super_admin: boolean;
  [key: string]: unknown;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<IUserContent | null>;
  create(name: string, email: string, passwordHash: string): Promise<IUserContent>;
  createWithClient(client: PoolClient, name: string, email: string, passwordHash: string): Promise<IUserContent>;
  updatePassword(userId: number, newPasswordHash: string): Promise<void>;
}