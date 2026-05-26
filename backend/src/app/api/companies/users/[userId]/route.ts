import { NextRequest } from 'next/server';
import { apiResponse } from '@/utils/api-response';
import { memberService } from '@/services/member.service';
import { z } from 'zod';

const updateSchema = z.object({
  roleId: z.number().int().positive().optional(),
  status: z.enum(['active', 'inactive']).optional()
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> } // <-- Tipado como Promesa en Next.js 15
) {
  try {
    // 1. Resolvemos la promesa de los parámetros primero
    const resolvedParams = await params;
    const targetUserId = parseInt(resolvedParams.userId, 10); 

    const companyIdStr = request.headers.get('x-company-id');
    const operatorIdStr = request.headers.get('x-user-id');
    
    if (!companyIdStr || !operatorIdStr) throw new Error('Faltan cabeceras de seguridad');

    const companyId = parseInt(companyIdStr, 10);
    const operatorId = parseInt(operatorIdStr, 10);

    const body = await request.json();
    const data = updateSchema.parse(body);

    await memberService.updateMember(operatorId, companyId, targetUserId, data);

    return apiResponse.success(null, 'Miembro actualizado exitosamente');
  } catch (error) {
    return apiResponse.catchError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> } // <-- Tipado como Promesa en Next.js 15
) {
  try {
    // 1. Resolvemos la promesa de los parámetros primero
    const resolvedParams = await params;
    const targetUserId = parseInt(resolvedParams.userId, 10);

    const companyIdStr = request.headers.get('x-company-id');
    const operatorIdStr = request.headers.get('x-user-id');
    
    if (!companyIdStr || !operatorIdStr) throw new Error('Faltan cabeceras de seguridad');

    const companyId = parseInt(companyIdStr, 10);
    const operatorId = parseInt(operatorIdStr, 10);

    await memberService.removeMember(operatorId, companyId, targetUserId);

    return apiResponse.success(null, 'Miembro removido exitosamente');
  } catch (error) {
    return apiResponse.catchError(error);
  }
}