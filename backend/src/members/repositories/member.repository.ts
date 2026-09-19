import { Injectable, NotFoundException, ConflictException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const TEMP_PASSWORD_LENGTH = 12;

@Injectable()
export class MemberRepository {
  constructor(private dataSource: DataSource) {}

  async getMembersByCompany(companyId: string) {
    return this.dataSource.query(
      `SELECT
         u.id, u.email, u.name, u.created_at,
         COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles,
         CASE WHEN u.locked_until IS NOT NULL AND u.locked_until > NOW()
           THEN 'inactive' ELSE 'active'
         END as status
       FROM users u
       INNER JOIN user_contexts uc ON u.id = uc.user_id
       LEFT JOIN roles r ON uc.role_id = r.id
       WHERE uc.company_id = $1 AND u.deleted_at IS NULL
       GROUP BY u.id, u.email, u.name, u.created_at, u.locked_until
       ORDER BY u.name, u.email`,
      [companyId],
    );
  }

  async isAlreadyMember(userId: string, companyId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT 1 FROM user_contexts WHERE user_id = $1 AND company_id = $2`,
      [userId, companyId],
    );
    return result.length > 0;
  }

  async addMember(companyId: string, email: string, name: string, roleIds: number[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
      let tempPassword = '';
      for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
        tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

      let userResult = await queryRunner.query(
        `SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL`,
        [email],
      );

      let userId: string;
      let isNewUser = false;

      if (userResult.length > 0) {
        userId = userResult[0].id;
        const memberCheck = await queryRunner.query(
          `SELECT 1 FROM user_contexts WHERE user_id = $1 AND company_id = $2`,
          [userId, companyId],
        );
        if (memberCheck.length > 0) {
          await queryRunner.rollbackTransaction();
          throw new ConflictException('El usuario ya es miembro de esta empresa');
        }
      } else {
        const newUser = await queryRunner.query(
          `INSERT INTO users (email, password_hash, name, must_change_password)
           VALUES ($1, $2, $3, TRUE)
           RETURNING id`,
          [email, passwordHash, name],
        );
        userId = newUser[0].id;
        isNewUser = true;
      }

      let finalRoleIds = roleIds;
      if (!finalRoleIds || finalRoleIds.length === 0) {
        const defaultRole = await queryRunner.query(
          `SELECT id FROM roles WHERE name = 'Admin' AND company_id IS NULL LIMIT 1`,
        );
        finalRoleIds = defaultRole.length > 0 ? [defaultRole[0].id] : [];
      }

      for (const roleId of finalRoleIds) {
        await queryRunner.query(
          `INSERT INTO user_contexts (user_id, company_id, role_id)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [userId, companyId, roleId],
        );
      }

      await queryRunner.commitTransaction();

      return {
        id: userId,
        name,
        email,
        temporary_password: isNewUser ? tempPassword : undefined,
        role_assigned: finalRoleIds[0],
        isNewUser,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof ConflictException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al agregar el miembro');
    } finally {
      await queryRunner.release();
    }
  }

  async updateMember(companyId: string, userId: string, data: { roleIds?: number[]; status?: string }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.query(
        `SELECT 1 FROM user_contexts WHERE user_id = $1 AND company_id = $2`,
        [userId, companyId],
      );
      if (existing.length === 0) {
        throw new NotFoundException('El usuario no es miembro de esta empresa');
      }

      if (data.roleIds && data.roleIds.length > 0) {
        await queryRunner.query(
          `DELETE FROM user_contexts WHERE user_id = $1 AND company_id = $2`,
          [userId, companyId],
        );

        for (const roleId of data.roleIds) {
          await queryRunner.query(
            `INSERT INTO user_contexts (user_id, company_id, role_id)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [userId, companyId, roleId],
          );
        }
      }

      if (data.status) {
        if (data.status === 'inactive') {
          await queryRunner.query(
            `UPDATE users SET locked_until = NOW() + interval '100 years' WHERE id = $1`,
            [userId],
          );
        } else {
          await queryRunner.query(
            `UPDATE users SET locked_until = NULL, failed_login_attempts = 0 WHERE id = $1`,
            [userId],
          );
        }
      }

      await queryRunner.commitTransaction();
      return { message: 'Miembro actualizado correctamente' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar el miembro');
    } finally {
      await queryRunner.release();
    }
  }

  async removeMember(companyId: string, userId: string) {
    const result = await this.dataSource.query(
      `DELETE FROM user_contexts WHERE user_id = $1 AND company_id = $2`,
      [userId, companyId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('El usuario no es miembro de esta empresa');
    }

    return { message: 'Miembro eliminado de la empresa correctamente' };
  }
}
