import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller.js';
import { CompanyService } from './company.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PasswordChangedGuard } from '../auth/guards/password-changed.guard.js';

describe('CompanyController', () => {
  let controller: CompanyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        { provide: CompanyService, useValue: { getUserCompanies: vi.fn(), createCompany: vi.fn(), updateCompanyInfo: vi.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PasswordChangedGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CompanyController>(CompanyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
