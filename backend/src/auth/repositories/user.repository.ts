import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRepository {
  constructor(private dataSource: DataSource) {}

  async findByEmail(email: string) {
    const result = await this.dataSource.query(
      `SELECT id, email, name, password_hash, must_change_password, email_verified,
              failed_login_attempts, locked_until, password_changed_at
       FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email],
    );
    return result[0];
  }

  async findById(userId: string) {
    const result = await this.dataSource.query(
      `SELECT id, email, name, must_change_password, email_verified, password_changed_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [userId],
    );
    return result[0];
  }

  async create(email: string, passwordHash: string, name?: string) {
    const result = await this.dataSource.query(
      `INSERT INTO users (email, password_hash, name, must_change_password) 
       VALUES ($1, $2, $3, FALSE) 
       RETURNING id, email, name, must_change_password`,
      [email, passwordHash, name || null],
    );
    return result[0];
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE users SET password_hash = $1, password_changed_at = NOW() WHERE id = $2`,
      [newPasswordHash, userId],
    );
  }

  async setMustChangePassword(userId: string, value: boolean): Promise<void> {
    await this.dataSource.query(
      `UPDATE users SET must_change_password = $1 WHERE id = $2`,
      [value, userId],
    );
  }

  async updateTemporaryPassword(userId: string, newPasswordHash: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE users SET password_hash = $1, must_change_password = FALSE, password_changed_at = NOW() WHERE id = $2`,
      [newPasswordHash, userId],
    );
  }

  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1`,
      [userId],
    );
  }

  async lockAccount(userId: string, lockMinutes: number = 15): Promise<void> {
    await this.dataSource.query(
      `UPDATE users SET locked_until = NOW() + ($2 || ' minutes')::interval WHERE id = $1`,
      [userId, String(lockMinutes)],
    );
  }

  async resetFailedLoginAttempts(userId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
      [userId],
    );
  }

  async setEmailVerified(userId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE id = $1`,
      [userId],
    );
  }

  async setEmailVerificationToken(userId: string, token: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE users SET email_verification_token = $1 WHERE id = $2`,
      [token, userId],
    );
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }

    if (updates.length === 0) return;

    values.push(userId);
    await this.dataSource.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
      values,
    );
  }
}
