import { NextRequest } from 'next/server';
import { roleRepository } from '@/repositories/role.repository';
import { apiResponse } from '@/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const permissions = await roleRepository.getAllPermissions();
    return apiResponse.success(permissions);
  } catch (error) {
    return apiResponse.catchError(error);
  }
}