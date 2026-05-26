import { z } from 'zod';
import { companyService } from '@/services/company.service';
import { apiResponse } from '@/utils/api-response';
import { getContext } from '@/utils/get-context';
import { generateToken } from '@/utils/jwt';

const createCompanySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  tax_id: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { userId } = getContext(request);
    const companies = await companyService.getUserCompanies(userId);
    return apiResponse.success(companies);
  } catch (error) {
    return apiResponse.catchError(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = getContext(request);
    const userId = context.userId;
    
    const body = await request.json();
    const { name, tax_id } = createCompanySchema.parse(body);

    // 1. Creamos la empresa
    const newCompany = await companyService.createCompany(userId, name, tax_id);

    // 2. Buscamos la lista ACTUALIZADA de empresas del usuario
    const allCompanies = await companyService.getUserCompanies(userId);
    const companyIds = allCompanies.map((c: any) => c.id);

    // 3. Generamos un NUEVO token con la nueva empresa incluida
    const newToken = generateToken({
      id: userId,
      // Usamos el valor del contexto, o por defecto false
      is_super_admin: context.isSuperAdmin || context.is_super_admin || false, 
      companies: companyIds
    });

    // 4. IMPORTANTE: Ahora devolvemos un objeto con la empresa Y el nuevo token
    return apiResponse.created({ 
      company: newCompany, 
      token: newToken 
    }, 'Empresa creada exitosamente');

  } catch (error) {
    return apiResponse.catchError(error);
  }
}