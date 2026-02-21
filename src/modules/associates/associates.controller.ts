import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AssociatesService } from './associates.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { TenantGuard } from 'src/common/tenant/tenant.guard';
import {
  AssociateDto,
  AssociateRouteParameters,
  FindAllParameters,
} from './associate.dto';
import { ApiCreateAssociateDoc } from './docs/create-associate.doc';
import { ApiFindAllAssociatesDoc } from './docs/find-all-associate.docs';
import { ApiFindByIdAssociateDoc } from './docs/find-by-id-associate.doc';
import { ApiUpdateAssociateDoc } from './docs/update-associate.doc';
import { Tenant } from '../../common/tenant/tenant.decorator';

@ApiTags('associates')
@UseGuards(AuthGuard, TenantGuard)
@ApiBearerAuth('access-token')
@Controller('associates')
export class AssociatesController {
  constructor(private readonly associatesService: AssociatesService) {}

  @Post()
  @ApiCreateAssociateDoc()
  async create(
    @Tenant() tenantId: string,
    @Body() associate: AssociateDto,
  ): Promise<AssociateDto> {
    return await this.associatesService.create({
      ...associate,
      organizationId: tenantId,
    });
  }

  @Get()
  @ApiFindAllAssociatesDoc()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @Tenant() tenantId: string,
    @Query() params: FindAllParameters,
  ): Promise<{ items: AssociateDto[]; total: number }> {
    return await this.associatesService.findAll(tenantId, params);
  }

  @Get('/:id')
  @ApiFindByIdAssociateDoc()
  async findById(
    @Param() params: AssociateRouteParameters,
  ): Promise<AssociateDto | null> {
    return await this.associatesService.findById(params.id);
  }

  @Put('/:id')
  @ApiUpdateAssociateDoc()
  async update(
    @Tenant() tenantId: string,
    @Param() params: AssociateRouteParameters,
    @Body() associate: AssociateDto,
  ) {
    await this.associatesService.update(params.id, {
      ...associate,
      organizationId: tenantId,
    });
  }
}
