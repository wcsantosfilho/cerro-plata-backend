import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { TenantGuard } from 'src/common/tenant/tenant.guard';
import { DueDto, FindAllParameters } from './due.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DuesService } from './dues.service';
import { ApiCreateDueDocs } from './docs/create-due.doc';
import { ApiGenerateDueDocs } from './docs/generate-due.doc';
import { ApiFindAllDueDocs } from './docs/find-all-due.doc';
import { Tenant } from '../../common/tenant/tenant.decorator';

@ApiTags('dues')
@UseGuards(AuthGuard, TenantGuard)
@ApiBearerAuth('access-token')
@Controller('dues')
export class DuesController {
  constructor(private readonly duesService: DuesService) {}

  @Post()
  @ApiCreateDueDocs()
  async create(
    @Tenant() tenantId: string,
    @Body() due: DueDto,
  ): Promise<DueDto> {
    return await this.duesService.create({
      ...due,
      organizationId: tenantId,
    });
  }

  @Post('generate')
  @ApiGenerateDueDocs()
  async generateDues(@Tenant() tenantId: string): Promise<DueDto> {
    return await this.duesService.generateDues(tenantId);
  }

  @Get()
  @ApiFindAllDueDocs()
  async findAll(
    @Tenant() tenantId: string,
    @Query() params: FindAllParameters,
  ): Promise<{ items: DueDto[]; total: number }> {
    return await this.duesService.findAll(tenantId, params);
  }
}
