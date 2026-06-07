import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'tu_secreto_super_seguro');

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // RADAR: Esto imprimirá en tu terminal cada petición que intente pasar
  console.log(`🛡️ FIREWALL INTERCEPTANDO: [${request.method}] ${path}`);

  // 0. Permitir Preflight CORS OPTIONS
  if (request.method === 'OPTIONS') {
    return NextResponse.next();
  }

  // 1. Ignorar rutas públicas (Login, Register, Swagger) - Forzamos minúsculas por seguridad
  if (path.toLowerCase().includes('/api/auth') || path.toLowerCase().includes('/api/docs')) {
    console.log('✅ Ruta pública detectada. Dejando pasar sin Token.');
    return NextResponse.next();
  }

  // 2. Validar que exista el Token
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Petición bloqueada: No hay Token en el header.');
    return NextResponse.json({ success: false, error: 'No autorizado. Token faltante.' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const requestHeaders = new Headers(request.headers);
    
    // Inyectamos el ID del usuario en los headers para que los controladores lo consuman de forma segura
    requestHeaders.set('x-user-id', String(payload.id));

    // Rutas exentas de obligatoriedad de Company ID (ej: Perfil, crear/listar empresas)
    const isExemptRoute = path.match(/^\/api\/(user|companies$)/);

    const companyId = request.headers.get('x-company-id');
    
    if (companyId) {
      const userCompanies = (payload.companies as number[]) || [];
      const requestedCompanyId = parseInt(companyId, 10);

      if (!userCompanies.includes(requestedCompanyId)) {
        console.log(`❌ Usuario ${payload.id} intentó acceder a la empresa ${requestedCompanyId} sin permisos.`);
        return NextResponse.json(
          { success: false, error: 'Acceso denegado. No perteneces a esta empresa.' }, 
          { status: 403 }
        );
      }
      
      // Inyectamos el Company ID purificado y verificado
      requestHeaders.set('x-company-id', String(requestedCompanyId));
    } else if (!isExemptRoute) {
      // Política Zero-Trust: Si la ruta requiere contexto (ej: /members) y no mandó el ID, se bloquea.
      console.log(`❌ Petición bloqueada: Falta cabecera x-company-id en ruta protegida (${path}).`);
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requiere el contexto de la empresa (x-company-id).' }, 
        { status: 400 }
      );
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (error) {
    console.log('❌ Token inválido o expirado.');
    return NextResponse.json({ success: false, error: 'Token inválido o expirado' }, { status: 401 });
  }
}

export const config = {
  matcher: '/api/:path*',
};