import { NextRequest } from 'next/server';
import { roleRepository } from '@/repositories/role.repository';
import { apiResponse } from '@/utils/api-response';
import { getContext } from '@/utils/get-context';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { companyId } = getContext(request);
    if (!companyId) throw new Error('MISSING_COMPANY');

    // Le pasamos el companyId a la consulta
    const roles = await roleRepository.getRolesWithPermissions(companyId);
    return apiResponse.success(roles, 'Roles obtenidos exitosamente');
  } catch (error) {
    return apiResponse.catchError(error);
  }
}

const createRoleSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  permissionIds: z.array(z.number()).default([])
});

export async function POST(request: NextRequest) {
  try {
    const { companyId } = getContext(request);
    if (!companyId) throw new Error('MISSING_COMPANY');

    const body = await request.json();
    const { name, description, permissionIds } = createRoleSchema.parse(body);

    await roleRepository.createCustomRole(companyId, name, description || '', permissionIds);

    return apiResponse.created(null, 'Rol creado exitosamente');
  } catch (error) {
    return apiResponse.catchError(error);
  }
}