import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { pool } from '@/config/db';
import { apiResponse } from '@/utils/api-response';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Formato de correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal(''))
});

export async function PUT(request: NextRequest) {
  try {
    const operatorIdStr = request.headers.get('x-user-id');
    if (!operatorIdStr) throw new Error('No autorizado. Faltan cabeceras de seguridad.');
    const userId = parseInt(operatorIdStr, 10);

    const body = await request.json();
    const { name, email, password } = updateProfileSchema.parse(body);

    // 1. Validar que el correo no esté tomado por otro usuario diferente
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2 AND deleted_at IS NULL',
      [email, userId]
    );
    if (emailCheck.rows.length > 0) {
      throw new Error('El correo electrónico ya está en uso por otro usuario.');
    }

    // 2. Construir la consulta de actualización dinámicamente
    let query = 'UPDATE users SET name = $1, email = $2';
    const values = [name, email, userId];

    if (password && password.trim() !== '') {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      query += ', password_hash = $4 WHERE id = $3 RETURNING id, name, email, is_super_admin';
      values.push(hashedPassword);
    } else {
      query += ' WHERE id = $3 RETURNING id, name, email, is_super_admin';
    }

    const result = await pool.query(query, values);
    const updatedUser = result.rows[0];

    return apiResponse.success(updatedUser, 'Perfil actualizado correctamente');
  } catch (error) {
    return apiResponse.catchError(error);
  }
}