import { Controller } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import {
  OrganizationDto,
  OrganizationRouteParameters,
} from './organization.dto';
import { OrganizationsService } from './organizations.service';
import { Get, Body, Post, Param } from '@nestjs/common';
import { ApiGetOrganizationDocs } from './docs/get-organization.doc';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('organizations')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiExcludeEndpoint()
  async create(
    @Body() organization: OrganizationDto,
  ): Promise<OrganizationDto> {
    return await this.organizationsService.create(organization);
  }

  @Get('tenant')
  @ApiGetOrganizationDocs()
  getProfile(@CurrentTenant() tenantId: string) {
    return this.organizationsService.findByTenant(tenantId);
  }

  @Get('/:id')
  @ApiGetOrganizationDocs()
  async findById(
    @Param() params: OrganizationRouteParameters,
  ): Promise<OrganizationDto | null> {
    return await this.organizationsService.findById(params.organizationId);
  }
}
