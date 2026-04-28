import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { TenantGuard } from '../../common/tenant/tenant.guard';
import {
  DueDto,
  FindAllParameters,
  GenerateDuesDto,
  DueRouteParameters,
} from './due.dto';
import { PatchDueDto } from './patchDue.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DuesService } from './dues.service';
import { ApiCreateDueDocs } from './docs/create-due.doc';
import { ApiGenerateDueDocs } from './docs/generate-due.doc';
import { ApiFindAllDueDocs } from './docs/find-all-due.doc';
import { ApiPartialUpdateDueDoc } from './docs/partial-update-due.doc';
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
  async generateDues(
    @Tenant() tenantId: string,
    @Body() params: GenerateDuesDto,
  ): Promise<DueDto[]> {
    return await this.duesService.generateDues(tenantId, params);
  }

  @Get()
  @ApiFindAllDueDocs()
  async findAll(
    @Tenant() tenantId: string,
    @Query() params: FindAllParameters,
  ): Promise<{ items: DueDto[]; total: number }> {
    return await this.duesService.findAll(tenantId, params);
  }

  @Patch('/:id')
  @ApiPartialUpdateDueDoc()
  async patch(
    @Tenant() tenantId: string,
    @Param() params: DueRouteParameters,
    @Body() due: PatchDueDto,
  ): Promise<DueDto> {
    return await this.duesService.update(params.id, {
      ...due,
      organizationId: tenantId,
    });
  }
}
