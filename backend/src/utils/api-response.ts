import { NextResponse } from 'next/server';
import { z } from 'zod';

// Definimos las interfaces para mantener el tipado estricto
type SuccessResponse<T> = {
  success: true;
  message?: string;
  data?: T;
};

type ErrorResponse = {
  success: false;
  error: string;
  details?: any; // Útil para enviar detalles de validación de Zod
};

export const apiResponse = {
  // -------------------------
  // RESPUESTAS DE ÉXITO (2xx)
  // -------------------------
  success: <T>(data: T, message?: string, status = 200) => {
    return NextResponse.json(
      { success: true, message, data } as SuccessResponse<T>, 
      { status }
    );
  },
  
  created: <T>(data: T, message = 'Recurso creado exitosamente') => {
    return NextResponse.json(
      { success: true, message, data } as SuccessResponse<T>, 
      { status: 201 }
    );
  },

  // -------------------------
  // RESPUESTAS DE ERROR (4xx, 5xx)
  // -------------------------
  error: (message: string, status = 400, details?: any) => {
    return NextResponse.json(
      { success: false, error: message, details } as ErrorResponse, 
      { status }
    );
  },

  unauthorized: (message = 'No autorizado. Token faltante o inválido.') => {
    return NextResponse.json(
      { success: false, error: message } as ErrorResponse, 
      { status: 401 }
    );
  },

// -------------------------
  // MANEJADOR GLOBAL DE ERRORES (El más importante)
  // -------------------------
  catchError: (error: unknown) => {
    // 1. CORRECCIÓN: Zod utiliza 'issues', no 'errors'
if (error instanceof z.ZodError) {
      // Extraemos el primer problema detectado
      const issue = error.issues[0];
      // Obtenemos el nombre del campo que falló (ej: "password", "companyName")
      const fieldName = issue?.path.join('.') || 'Campo desconocido';
      // Construimos un mensaje súper claro
      const errorMessage = `Error en '${fieldName}': ${issue?.message}`;
      
      return apiResponse.error(errorMessage, 400, error.issues);
    }

    if (error instanceof Error) {
      // SI SON CREDENCIALES, ENVIAMOS EL MENSAJE EXACTO
      if (error.message === 'Credenciales inválidas') {
        return apiResponse.error('Correo o contraseña incorrectos.', 401);
      }

      if (error.message === 'UNAUTHORIZED') {
        return apiResponse.unauthorized();
      }
      
      if (error.message === 'MISSING_COMPANY') {
        return apiResponse.error('Debe seleccionar una empresa enviando el header x-company-id', 400);
      }

      return apiResponse.error(error.message, 400);
    }

    console.error('[API Error no controlado]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' } as ErrorResponse, 
      { status: 500 }
    );
  }
};