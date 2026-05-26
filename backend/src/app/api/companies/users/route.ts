import { z } from 'zod';
import { memberService } from '@/services/member.service'; // Importamos la instancia (minúscula)
import { apiResponse } from '@/utils/api-response';
import { getContext } from '@/utils/get-context';

const addMemberSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('El formato del correo es inválido'),
  role_id: z.number().int('El ID del rol debe ser un número entero'),
});

export async function GET(request: Request) {
  try {
    const { userId, companyId } = getContext(request);
    if (!companyId) throw new Error('MISSING_COMPANY');

    // Usamos "memberService" instanciado
    const members = await memberService.getMembers(userId, companyId);
    return apiResponse.success(members, 'Miembros obtenidos exitosamente');

  } catch (error) {
    return apiResponse.catchError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { userId, companyId } = getContext(request);
    if (!companyId) throw new Error('MISSING_COMPANY');

    const body = await request.json();
    const { name, email, role_id } = addMemberSchema.parse(body);

    // Usamos "memberService" instanciado
    const newMember = await memberService.addMemberToCompany(userId, companyId, name, email, role_id);
    return apiResponse.created(newMember, 'Usuario añadido al equipo exitosamente');

  } catch (error) {
    return apiResponse.catchError(error);
  }
}