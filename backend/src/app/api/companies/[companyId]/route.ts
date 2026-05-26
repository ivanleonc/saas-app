import { NextRequest } from 'next/server';
import { z } from 'zod';
import { companyService } from '@/services/company.service';
import { apiResponse } from '@/utils/api-response';

// Validamos que envíen al menos un dato válido para actualizar
const updateCompanySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  tax_id: z.string().optional()
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> } // Promesa para Next.js 15
) {
  try {
    const resolvedParams = await params;
    const targetCompanyId = parseInt(resolvedParams.companyId, 10); 

    const operatorIdStr = request.headers.get('x-user-id');
    const headerCompanyIdStr = request.headers.get('x-company-id');
    
    if (!operatorIdStr || !headerCompanyIdStr) {
      throw new Error('Faltan cabeceras de seguridad');
    }

    const operatorId = parseInt(operatorIdStr, 10);
    const headerCompanyId = parseInt(headerCompanyIdStr, 10);

    // Seguridad estricta: El ID de la URL debe coincidir con el header autorizado
    if (targetCompanyId !== headerCompanyId) {
       throw new Error('Inconsistencia en los identificadores de empresa');
    }

    const body = await request.json();
    const data = updateCompanySchema.parse(body);

    const updatedCompany = await companyService.updateCompanyInfo(operatorId, targetCompanyId, data);

    return apiResponse.success(updatedCompany, 'Configuración de la empresa actualizada');
  } catch (error) {
    return apiResponse.catchError(error);
  }
}