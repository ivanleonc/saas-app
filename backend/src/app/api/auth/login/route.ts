import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { apiResponse } from '@/utils/api-response';

const loginSchema = z.object({
  email: z.string().email('El formato del email es inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const { message, ...data } = await authService.login(email, password);
    return apiResponse.success(data, message);
  } catch (error) {
    return apiResponse.catchError(error);
  }
}