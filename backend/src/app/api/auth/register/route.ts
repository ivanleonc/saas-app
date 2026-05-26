import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { apiResponse } from '@/utils/api-response';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('El formato del email es inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    const result = await authService.register(name, email, password);
    return apiResponse.created(result, 'Usuario registrado exitosamente');
  } catch (error) {
    return apiResponse.catchError(error);
  }
}