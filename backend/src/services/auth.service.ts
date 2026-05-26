import bcrypt from 'bcrypt';
import { UserRepository } from '@/repositories/user.repository';
import { CompanyRepository } from '@/repositories/company.repository';
import { generateToken } from '@/utils/jwt';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private companyRepository: CompanyRepository
  ) {}

async register(name: string, email: string, passwordPlain: string) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);

    // 1. Creamos el usuario
    const newUser = await this.userRepository.create(name, email, passwordHash);

    // 2. Creamos una empresa por defecto para este nuevo usuario
    // Usaremos el nombre del usuario para el nombre de la empresa por ahora.
    await this.companyRepository.createWithOwner(newUser.id, `Empresa de ${name}`);

    // 3. Buscamos los tenants del usuario (exactamente igual que en el login)
    const rows = await this.companyRepository.getUserCompanies(newUser.id);
    const tenantsMap: Record<number, any> = {};
    
    rows.forEach((row: any) => {
      if (!tenantsMap[row.id]) {
        tenantsMap[row.id] = {
          id: row.id,
          name: row.name,
          tax_id: row.tax_id,
          role: row.role_name,
          permissions: new Set()
        };
      }
      if (row.permission_name) {
        tenantsMap[row.id].permissions.add(row.permission_name);
      }
    });

    const tenants = Object.values(tenantsMap).map((tenant: any) => ({
      ...tenant,
      permissions: Array.from(tenant.permissions)
    }));

    const companyIds = tenants.map(t => t.id);

    // 4. Generamos el token con el arreglo de empresas correcto
    const token = generateToken({ 
      id: newUser.id, 
      is_super_admin: newUser.is_super_admin,
      companies: companyIds 
    });

    // 5. Devolvemos la misma estructura exacta que espera el frontend
    return {
      message: 'Registro exitoso',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        is_super_admin: newUser.is_super_admin,
        tenants: tenants // <--- ¡La pieza clave!
      }
    };
  }

  async login(email: string, passwordPlain: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    const isPasswordValid = await bcrypt.compare(passwordPlain, user.password_hash);
    if (!isPasswordValid) throw new Error('Credenciales inválidas');

    const rows = await this.companyRepository.getUserCompanies(user.id);
    const tenantsMap: Record<number, any> = {};
    
    rows.forEach((row: any) => {
      if (!tenantsMap[row.id]) {
        tenantsMap[row.id] = {
          id: row.id,
          name: row.name,
          tax_id: row.tax_id,
          role: row.role_name,
          permissions: new Set()
        };
      }
      if (row.permission_name) {
        tenantsMap[row.id].permissions.add(row.permission_name);
      }
    });

    const tenants = Object.values(tenantsMap).map((tenant: any) => ({
      ...tenant,
      permissions: Array.from(tenant.permissions)
    }));

    const companyIds = tenants.map(t => t.id);

    const token = generateToken({ 
      id: user.id, 
      is_super_admin: user.is_super_admin,
      companies: companyIds 
    });

    return {
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_super_admin: user.is_super_admin,
        tenants
      }
    };
  }
}

export const authService = new AuthService(
  new UserRepository(),
  new CompanyRepository()
);