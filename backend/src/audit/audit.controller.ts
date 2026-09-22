import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service.js';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('api/audit')
export class AuditController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Obtener logs de auditoria de la empresa' })
  @ApiHeader({ name: 'x-company-id', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  async getLogs(
    @Headers('x-company-id') companyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const result = await this.auditLogService.findFiltered({
      companyId,
      page: parseInt(page || '1', 10),
      limit: Math.min(parseInt(limit || '20', 10), 100),
      entityType,
      action,
      userId,
      from,
      to,
    });
    return { success: true, ...result };
  }

  @Get('logs/export')
  @ApiOperation({ summary: 'Exportar logs de auditoria como CSV' })
  @ApiHeader({ name: 'x-company-id', required: true })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  async exportLogs(
    @Headers('x-company-id') companyId: string,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.auditLogService.exportCsv({
      companyId,
      entityType,
      action,
      userId,
      from,
      to,
    });
  }

  @Get('entity-types')
  @ApiOperation({ summary: 'Obtener tipos de entidad disponibles' })
  @ApiHeader({ name: 'x-company-id', required: true })
  async getEntityTypes(@Headers('x-company-id') companyId: string) {
    const types = await this.auditLogService.getEntityTypes(companyId);
    return { success: true, data: types.map((t: any) => t.entity_type) };
  }
}
