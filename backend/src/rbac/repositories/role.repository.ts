import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PROTECTED_ROLES } from '../../common/constants/roles.js';

@Injectable()
export class RoleRepository {
  constructor(private dataSource: DataSource) {}

  async findAll(companyId?: string) {
    if (companyId) {
      return this.dataSource.query(
        `SELECT id, name, company_id FROM roles
         WHERE (company_id IS NULL OR company_id = $1) AND deleted_at IS NULL
         ORDER BY name`,
        [companyId],
      );
    }
    return this.dataSource.query(
      `SELECT id, name, company_id FROM roles WHERE deleted_at IS NULL ORDER BY name`,
    );
  }

  async findById(id: string) {
    const result = await this.dataSource.query(
      `SELECT id, name, company_id FROM roles WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return result[0];
  }

  async findByName(name: string, companyId?: string) {
    if (companyId) {
      const result = await this.dataSource.query(
        `SELECT id, name, company_id FROM roles
         WHERE name = $1 AND (company_id IS NULL OR company_id = $2) AND deleted_at IS NULL`,
        [name, companyId],
      );
      return result[0];
    }
    const result = await this.dataSource.query(
      `SELECT id, name, company_id FROM roles WHERE name = $1 AND deleted_at IS NULL`,
      [name],
    );
    return result[0];
  }

  async create(name: string, companyId?: string) {
    const result = await this.dataSource.query(
      `INSERT INTO roles (name, company_id) VALUES ($1, $2) RETURNING id, name, company_id`,
      [name, companyId || null],
    );
    return result[0];
  }

  async delete(id: string) {
    const placeholders = PROTECTED_ROLES.map((_, i) => `$${i + 2}`).join(', ');
    await this.dataSource.query(
      `UPDATE roles SET deleted_at = NOW() WHERE id = $1 AND name NOT IN (${placeholders})`,
      [id, ...PROTECTED_ROLES],
    );
  }

  async getPermissions(roleId: string) {
    return this.dataSource.query(
      `SELECT p.id, p.code, p.module
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1
       ORDER BY p.module, p.code`,
      [roleId],
    );
  }

  async setPermissions(roleId: string, permissionIds: string[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `DELETE FROM role_permissions WHERE role_id = $1`,
        [roleId],
      );

      if (permissionIds.length > 0) {
        const values = permissionIds
          .map((pid, i) => `($1, $${i + 2})`)
          .join(', ');
        await queryRunner.query(
          `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`,
          [roleId, ...permissionIds],
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getRolesWithPermissions(companyId?: string) {
    let query: string;
    let params: any[];

    if (companyId) {
      query = `
        SELECT r.id, r.name, r.company_id,
          COALESCE(
            json_agg(
              json_build_object('id', p.id, 'code', p.code, 'module', p.module)
            ) FILTER (WHERE p.id IS NOT NULL),
            '[]'
          ) as permissions
        FROM roles r
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON rp.permission_id = p.id
        WHERE r.deleted_at IS NULL
          AND (r.company_id IS NULL OR r.company_id = $1)
        GROUP BY r.id, r.name, r.company_id
        ORDER BY r.name
      `;
      params = [companyId];
    } else {
      query = `
        SELECT r.id, r.name, r.company_id,
          COALESCE(
            json_agg(
              json_build_object('id', p.id, 'code', p.code, 'module', p.module)
            ) FILTER (WHERE p.id IS NOT NULL),
            '[]'
          ) as permissions
        FROM roles r
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON rp.permission_id = p.id
        WHERE r.deleted_at IS NULL
        GROUP BY r.id, r.name, r.company_id
        ORDER BY r.name
      `;
      params = [];
    }

    return this.dataSource.query(query, params);
  }

  async getUserRolesForCompany(userId: string, companyId: string) {
    return this.dataSource.query(
      `SELECT r.id, r.name
       FROM roles r
       INNER JOIN user_contexts uc ON r.id = uc.role_id
       WHERE uc.user_id = $1 AND uc.company_id = $2`,
      [userId, companyId],
    );
  }

  async getUserPermissions(userId: string, companyId: string) {
    return this.dataSource.query(
      `SELECT DISTINCT p.code
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       INNER JOIN user_contexts uc ON rp.role_id = uc.role_id
       WHERE uc.user_id = $1 AND uc.company_id = $2`,
      [userId, companyId],
    );
  }
}
