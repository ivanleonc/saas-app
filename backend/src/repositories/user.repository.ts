import { pool } from '@/config/db';
import type { PoolClient } from 'pg';
import type { IUserRepository } from './interfaces/user.repository.interface';

export class UserRepository implements IUserRepository {
  async findByEmail(email: string) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
    return result.rows[0];
  }

  // Creado para el registro simple en AuthService (no requiere transacción)
  async create(name: string, email: string, passwordHash: string) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );
    return result.rows[0];
  }

  // Usado en MemberService (requiere cliente para la transacción orquestada)
  async createWithClient(client: PoolClient, name: string, email: string, passwordHash: string) {
    const result = await client.query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );
    return result.rows[0];
  }
}