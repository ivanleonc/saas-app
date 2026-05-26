import axios from 'axios';
import { TokenService } from '@/utils/token.service';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenService.getToken();
    if (token && config.headers) {
      // Usamos la asignación de diccionario que es a prueba de fallos en cualquier versión de Axios
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuestas
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 1. Limpieza total
      TokenService.destroyToken();
      localStorage.removeItem('saas_user');
      localStorage.removeItem('saas_active_tenant');
      
      // 2. Redirigir SOLO si no estamos ya en la página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);