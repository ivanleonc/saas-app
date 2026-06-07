import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { apiResponse } from '@/utils/api-response';

const resetPasswordSchema = z.object({
  email: z.string().email('El formato del email es inválido'),
  token: z.string().min(1, 'El token es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token, password } = resetPasswordSchema.parse(body);

    const data = await authService.resetPassword(email, token, password);
    return apiResponse.success(data, data.message);
  } catch (error) {
    return apiResponse.catchError(error);
  }
}