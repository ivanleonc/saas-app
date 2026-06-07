import { pool } from '@/config/db';
import type { IRoleRepository } from './interfaces/role.repository.interface';

export class RoleRepository implements IRoleRepository {
  // NUEVO: Ahora recibe el companyId
  async getRolesWithPermissions(companyId: number) {
    const query = `
      SELECT 
        r.id, 
        r.name, 
        r.description, 
        r.is_system,
        r.company_id,
        COALESCE(
          json_agg(
            json_build_object('id', p.id, 'name', p.name, 'module', p.module_group)
          ) FILTER (WHERE p.id IS NOT NULL), '[]'
        ) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      -- EL TRUCO ESTÁ AQUÍ: Traemos los del sistema (NULL) y los de esta empresa
      WHERE r.company_id IS NULL OR r.company_id = $1
      GROUP BY r.id
      ORDER BY r.is_system DESC, r.id ASC
    `;
    const result = await pool.query(query, [companyId]);
    return result.rows;
  }
  // 1. Obtener el catálogo maestro de permisos
  async getAllPermissions() {
    const result = await pool.query('SELECT id, name, module_group, description FROM permissions ORDER BY module_group, id');
    return result.rows;
  }

  // 2. Transacción para crear un Rol Personalizado y asignarle sus permisos
  async createCustomRole(companyId: number, name: string, description: string, permissionIds: number[]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // A. Insertar el rol y obtener su ID
      const roleResult = await client.query(
        `INSERT INTO roles (name, description, is_system, company_id) 
         VALUES ($1, $2, false, $3) RETURNING id`,
        [name, description, companyId]
      );
      const newRoleId = roleResult.rows[0].id;

      // B. Insertar los permisos en la tabla puente (si se seleccionaron)
      if (permissionIds && permissionIds.length > 0) {
        // Construye algo como "($1, $2), ($1, $3)" dinámicamente
        const values = permissionIds.map((_, i) => `($1, $${i + 2})`).join(', ');
        const queryParams = [newRoleId, ...permissionIds];
        await client.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`, queryParams);
      }

      await client.query('COMMIT');
      return newRoleId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const roleRepository = new RoleRepository();