import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { apiResponse } from '@/utils/api-response';

const forgotPasswordSchema = z.object({
  email: z.string().email('El formato del email es inválido')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const data = await authService.requestPasswordReset(email);
    return apiResponse.success(data, data.message);
  } catch (error) {
    return apiResponse.catchError(error);
  }
}