export function getContext(request: Request) {
  const userIdHeader = request.headers.get('x-user-id');
  const companyIdHeader = request.headers.get('x-company-id');

  // Si no hay userId, es un error crítico (el middleware debió detenerlo antes)
  if (!userIdHeader) {
    throw new Error('UNAUTHORIZED');
  }

  return {
    userId: parseInt(userIdHeader, 10),
    // Si viene el header de la empresa, lo parseamos; si no, queda como undefined
    companyId: companyIdHeader ? parseInt(companyIdHeader, 10) : undefined,
  };
}