import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociatesService } from './associates.service';
import { AssociatesController } from './associates.controller';
import { AssociateEntity } from '../../db/entities/associate.entity';
import { OrganizationsModule } from '../organizations/organizations.module';
import { TenantContextService } from '../../common/tenant/tenant-context.service';
import { TenantGuard } from '../../common/tenant/tenant.guard';

@Module({
  controllers: [AssociatesController],
  imports: [TypeOrmModule.forFeature([AssociateEntity]), OrganizationsModule],
  providers: [AssociatesService, TenantContextService, TenantGuard],
  exports: [AssociatesService],
})
export class AssociatesModule {}
