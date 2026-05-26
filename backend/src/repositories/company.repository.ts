import { pool } from '@/config/db';
import type { PoolClient } from 'pg';
export class CompanyRepository {
  async getUserCompanies(userId: number) {
    const query = `
      SELECT 
        c.id, c.name, c.tax_id,
        COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles,
        COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}') as permissions
      FROM companies c
      INNER JOIN company_users cu ON c.id = cu.company_id
      LEFT JOIN company_user_roles cur ON cu.company_id = cur.company_id AND cu.user_id = cur.user_id
      LEFT JOIN roles r ON cur.role_id = r.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE cu.user_id = $1 AND cu.status = 'active'
      GROUP BY c.id, c.name, c.tax_id
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async createWithOwner(userId: number, name: string, taxId?: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const slug = name.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

      const companyResult = await client.query(
        `INSERT INTO companies (name, tax_id, slug) VALUES ($1, $2, $3) RETURNING *`,
        [name, taxId, slug]
      );
      const newCompany = companyResult.rows[0];

      const roleResult = await client.query(`SELECT id FROM roles WHERE name = 'Owner' AND company_id IS NULL`);
      const ownerRoleId = roleResult.rows[0].id;

      // 1. Insertamos al usuario en la empresa (SIN role_id)
      await client.query(
        `INSERT INTO company_users (company_id, user_id, status) VALUES ($1, $2, 'active')`,
        [newCompany.id, userId]
      );

      // 2. Insertamos su rol en la tabla puente
      await client.query(
        `INSERT INTO company_user_roles (company_id, user_id, role_id) VALUES ($1, $2, $3)`,
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
      `SELECT cur.role_id 
       FROM company_users cu
       LEFT JOIN company_user_roles cur ON cu.company_id = cur.company_id AND cu.user_id = cur.user_id
       WHERE cu.user_id = $1 AND cu.company_id = $2 AND cu.status = 'active'`,
      [userId, companyId]
    );
    
    if (result.rows.length === 0) return null;
    
    // Devolvemos un arreglo con todos los IDs de los roles que tiene el usuario
    return { roles: result.rows.map(row => row.role_id) };
  }

  async getCompanyMembers(companyId: number) {
    const result = await pool.query(
      `SELECT 
         u.id, 
         u.name, 
         u.email, 
         cu.status, 
         cu.created_at,
         -- Agrupamos los múltiples roles en un array
         COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
       FROM company_users cu
       INNER JOIN users u ON cu.user_id = u.id
       LEFT JOIN company_user_roles cur ON cu.company_id = cur.company_id AND cu.user_id = cur.user_id
       LEFT JOIN roles r ON cur.role_id = r.id
       WHERE cu.company_id = $1 AND u.deleted_at IS NULL
       GROUP BY u.id, u.name, u.email, cu.status, cu.created_at
       ORDER BY cu.created_at DESC`,
      [companyId]
    );
    return result.rows;
  }

  // ==========================================
  // AGREGAR MIEMBRO DENTRO DE UNA TRANSACCIÓN
  // ==========================================
async addMemberWithClient(client: PoolClient, companyId: number, userId: number, roleIds: number[]) {
    await client.query(
      `INSERT INTO company_users (company_id, user_id, status) VALUES ($1, $2, 'active')`,
      [companyId, userId]
    );

    if (roleIds && roleIds.length > 0) {
      for (const rId of roleIds) {
        await client.query(
          `INSERT INTO company_user_roles (company_id, user_id, role_id) VALUES ($1, $2, $3)`,
          [companyId, userId, rId]
        );
      }
    }
  }

  // ==========================================
  // ACTUALIZAR MIEMBRO (ESTADO Y ROLES)
  // ==========================================
  async updateCompanyUser(companyId: number, userId: number, data: { roleId?: number, roleIds?: number[], status?: string }) {
    // 1. Si enviaron un cambio de estado (ej: 'inactive'), lo actualizamos en company_users
    if (data.status) {
      await pool.query(
        `UPDATE company_users SET status = $1 WHERE company_id = $2 AND user_id = $3`,
        [data.status, companyId, userId]
      );
    }

    // 2. Preparamos los roles (soporta el viejo roleIds único o el nuevo array roleIds)
    let rolesToAssign: number[] = [];
    if (data.roleIds) {
      rolesToAssign = data.roleIds;
    } else if (data.roleId) {
      rolesToAssign = [data.roleId];
    }

    // 3. Si hay roles para actualizar, reemplazamos los viejos por los nuevos usando una transacción
    if (rolesToAssign.length > 0) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // A. Borramos los roles actuales del usuario en esta empresa
        await client.query(
          `DELETE FROM company_user_roles WHERE company_id = $1 AND user_id = $2`,
          [companyId, userId]
        );
        
        // B. Insertamos los nuevos roles
        for (const rId of rolesToAssign) {
          await client.query(
            `INSERT INTO company_user_roles (company_id, user_id, role_id) VALUES ($1, $2, $3)`,
            [companyId, userId, rId]
          );
        }
        
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }
  }

  // ==========================================
  // ELIMINAR MIEMBRO (HARD DELETE DE LA EMPRESA)
  // ==========================================
  async removeCompanyUser(companyId: number, userId: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Primero limpiamos sus roles en la tabla puente
      await client.query(
        `DELETE FROM company_user_roles WHERE company_id = $1 AND user_id = $2`,
        [companyId, userId]
      );
      
      // 2. Luego eliminamos su vínculo con la empresa
      await client.query(
        `DELETE FROM company_users WHERE company_id = $1 AND user_id = $2`,
        [companyId, userId]
      );
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(companyId: number, data: { name?: string; tax_id?: string }) {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (data.name) { updates.push(`name = $${paramIndex++}`); values.push(data.name); }
    if (data.tax_id) { updates.push(`tax_id = $${paramIndex++}`); values.push(data.tax_id); }

    if (updates.length === 0) return null;
    values.push(companyId);
    
    const query = `UPDATE companies SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}