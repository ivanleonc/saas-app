import { pool } from '@/config/db';
import type { PoolClient } from 'pg';

export class CompanyRepository {
  async getUserCompanies(userId: number) {
    const result = await pool.query(
      `SELECT 
         c.id, c.name, c.tax_id,
         cu.role_id, r.name as role_name,
         p.name as permission_name
       FROM companies c
       INNER JOIN company_users cu ON c.id = cu.company_id
       INNER JOIN roles r ON cu.role_id = r.id
       LEFT JOIN role_permissions rp ON r.id = rp.role_id
       LEFT JOIN permissions p ON rp.permission_id = p.id
       WHERE cu.user_id = $1 AND cu.status = 'active'`,
      [userId]
    );
    return result.rows;
  }

async createWithOwner(userId: number, name: string, taxId?: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // GENERAR EL SLUG AUTOMÁTICAMENTE
      // Convierte a minúsculas, quita acentos y cambia espacios por guiones
      const slug = name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quita tildes
        .replace(/[^a-z0-9\s-]/g, '')   // Quita caracteres especiales
        .replace(/[\s_-]+/g, '-')       // Cambia espacios por un solo guion
        .replace(/^-+|-+$/g, '');       // Quita guiones sobrantes al inicio/final

      // Agregamos "slug" tanto en las columnas como en los valores ($3)
      const companyResult = await client.query(
        `INSERT INTO companies (name, tax_id, slug) VALUES ($1, $2, $3) RETURNING *`,
        [name, taxId, slug]
      );
      const newCompany = companyResult.rows[0];

      const roleResult = await client.query(`SELECT id FROM roles WHERE name = 'Owner'`);
      const ownerRoleId = roleResult.rows[0].id;

      await client.query(
        `INSERT INTO company_users (company_id, user_id, role_id, status) VALUES ($1, $2, $3, 'active')`,
        [newCompany.id, userId, ownerRoleId]
      );

      await client.query('COMMIT');
      return newCompany;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async verifyUserBelongsToCompany(userId: number, companyId: number) {
    const result = await pool.query(
      `SELECT cu.role_id, r.name as role_name
       FROM company_users cu
       INNER JOIN roles r ON cu.role_id = r.id
       WHERE cu.user_id = $1 AND cu.company_id = $2 AND cu.status = 'active'`,
      [userId, companyId]
    );
    return result.rows[0];
  }

  async getCompanyMembers(companyId: number) {
    const result = await pool.query(
      `SELECT 
         u.id, 
         u.name, 
         u.email, 
         r.name AS role_name, 
         cu.status, 
         cu.created_at
       FROM company_users cu
       INNER JOIN users u ON cu.user_id = u.id
       INNER JOIN roles r ON cu.role_id = r.id
       WHERE cu.company_id = $1 AND u.deleted_at IS NULL
       ORDER BY cu.created_at DESC`,
      [companyId]
    );
    return result.rows;
  }

  async addMemberWithClient(client: PoolClient, companyId: number, userId: number, roleId: number) {
    await client.query(
      `INSERT INTO company_users (company_id, user_id, role_id, status) 
       VALUES ($1, $2, $3, 'active')`,
      [companyId, userId, roleId]
    );
  }

  async updateCompanyUser(companyId: number, userId: number, data: { roleId?: number, status?: string }) {
    // Constructor dinámico de Query para actualizar solo lo que venga en el payload
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (data.roleId) {
      updates.push(`role_id = $${paramIndex++}`);
      values.push(data.roleId);
    }
    if (data.status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (updates.length === 0) return;

    values.push(companyId, userId);
    
    // Ejecutamos el UPDATE
    const query = `UPDATE company_users SET ${updates.join(', ')} WHERE company_id = $${paramIndex++} AND user_id = $${paramIndex}`;
    await pool.query(query, values);
  }

  async removeCompanyUser(companyId: number, userId: number) {
    // Un "Hard Delete" de la tabla relacional (elimina la relación, NO el usuario del sistema)
    await pool.query(
      `DELETE FROM company_users WHERE company_id = $1 AND user_id = $2`,
      [companyId, userId]
    );
  }
  // ==========================================
  // ACTUALIZAR INFORMACIÓN DE LA EMPRESA
  // ==========================================
  async update(companyId: number, data: { name?: string; tax_id?: string }) {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Construimos la consulta dinámicamente según lo que envíe el frontend
    if (data.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.tax_id) {
      updates.push(`tax_id = $${paramIndex++}`);
      values.push(data.tax_id);
    }

    if (updates.length === 0) return null;

    values.push(companyId);
    
    // Ejecutamos el UPDATE y retornamos la empresa actualizada
    const query = `UPDATE companies SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}