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

    const newUser = await this.userRepository.create(name, email, passwordHash);

    await this.companyRepository.createWithOwner(newUser.id, `Empresa de ${name}`);

    // ¡Mucho más limpio! El repositorio ya nos da todo armado.
    const tenants = await this.companyRepository.getUserCompanies(newUser.id);
    const companyIds = tenants.map((t: any) => t.id);

    const token = generateToken({ 
      id: newUser.id, 
      is_super_admin: newUser.is_super_admin,
      companies: companyIds 
    });

    return {
      message: 'Registro exitoso',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        is_super_admin: newUser.is_super_admin,
        tenants
      }
    };
  }

  async login(email: string, passwordPlain: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    const isPasswordValid = await bcrypt.compare(passwordPlain, user.password_hash);
    if (!isPasswordValid) throw new Error('Credenciales inválidas');

    // ¡Mucho más limpio! El repositorio ya nos da todo armado.
    const tenants = await this.companyRepository.getUserCompanies(user.id);
    const companyIds = tenants.map((t: any) => t.id);

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