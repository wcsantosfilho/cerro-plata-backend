import { Controller } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { OrganizationDto } from './organization.dto';
import { OrganizationsService } from './organizations.service';
import { Body, Post } from '@nestjs/common';
import { ApiCreateOrganizationDocs } from './docs/create-organization.doc';

@ApiTags('organizations')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiCreateOrganizationDocs()
  async create(
    @Body() organization: OrganizationDto,
  ): Promise<OrganizationDto> {
    return await this.organizationsService.create(organization);
  }
}
