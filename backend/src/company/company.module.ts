import { Module, forwardRef } from '@nestjs/common';
import { CompanyService } from './company.service.js';
import { CompanyController } from './company.controller.js';
import { CompanyRepository } from './repositories/company.repository.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  controllers: [CompanyController],
  imports: [
    forwardRef(() => AuthModule), // <-- Rompemos el ciclo aquí también
  ],
  providers: [CompanyService, CompanyRepository],
  exports: [CompanyService, CompanyRepository], // Exportamos para que AuthModule pueda usarlos luego
})
export class CompanyModule {}