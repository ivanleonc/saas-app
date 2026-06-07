import { apiClient } from '@/api/axios';
import type { LoginPayload, RegisterPayload, AuthResponse } from '@/types/auth';

export class AuthService {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    return response.data;
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    return response.data;
  }

  async forgotPassword(email: string): Promise<any> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(payload: any): Promise<any> {
    const response = await apiClient.post('/auth/reset-password', payload);
    return response.data;
  }
}

// Exportamos la instancia, lista para usarse o mockearse
export const authService = new AuthService();