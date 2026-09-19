import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class BranchRepository {
  constructor(private dataSource: DataSource) {}

  async findByCompany(companyId: string) {
    return this.dataSource.query(
      `SELECT id, company_id, name, address, city, state, country, postal_code, phone, email, is_active, created_at, updated_at
       FROM branches
       WHERE company_id = $1 AND deleted_at IS NULL
       ORDER BY name`,
      [companyId],
    );
  }

  async findById(branchId: string, companyId: string) {
    const result = await this.dataSource.query(
      `SELECT id, company_id, name, address, city, state, country, postal_code, phone, email, is_active, created_at, updated_at
       FROM branches
       WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL`,
      [branchId, companyId],
    );
    return result[0] || null;
  }

  async create(companyId: string, data: {
    name: string; address?: string; city?: string; state?: string;
    country?: string; postal_code?: string; phone?: string; email?: string;
  }) {
    const result = await this.dataSource.query(
      `INSERT INTO branches (company_id, name, address, city, state, country, postal_code, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, company_id, name, address, city, state, country, postal_code, phone, email, is_active, created_at, updated_at`,
      [companyId, data.name, data.address || null, data.city || null, data.state || null,
       data.country || null, data.postal_code || null, data.phone || null, data.email || null],
    );
    return result[0];
  }

  async update(branchId: string, companyId: string, data: {
    name?: string; address?: string; city?: string; state?: string;
    country?: string; postal_code?: string; phone?: string; email?: string; is_active?: boolean;
  }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fields = ['name', 'address', 'city', 'state', 'country', 'postal_code', 'phone', 'email', 'is_active'] as const;
    for (const field of fields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(data[field]);
      }
    }

    if (updates.length === 0) return this.findById(branchId, companyId);

    values.push(branchId, companyId);
    const result = await this.dataSource.query(
      `UPDATE branches SET ${updates.join(', ')}
       WHERE id = $${paramIndex++} AND company_id = $${paramIndex} AND deleted_at IS NULL
       RETURNING id, company_id, name, address, city, state, country, postal_code, phone, email, is_active, created_at, updated_at`,
      values,
    );
    return result[0] || null;
  }

  async softDelete(branchId: string, companyId: string) {
    const existing = await this.findById(branchId, companyId);
    if (!existing) {
      throw new NotFoundException('Sede no encontrada');
    }

    const memberCount = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM user_contexts WHERE branch_id = $1`,
      [branchId],
    );

    if (parseInt(memberCount[0].count) > 0) {
      throw new ConflictException('No se puede eliminar una sede que tiene miembros asignados. Reasigna los miembros primero.');
    }

    await this.dataSource.query(
      `UPDATE branches SET deleted_at = NOW() WHERE id = $1 AND company_id = $2`,
      [branchId, companyId],
    );
    return { message: 'Sede eliminada correctamente' };
  }
}
