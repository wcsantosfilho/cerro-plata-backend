import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociatesModule } from '../associates/associates.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { TenantGuard } from '../../common/tenant/tenant.guard';
import { DuesService } from './dues.service';
import { DuesController } from './dues.controller';
import { DueEntity } from 'src/db/entities/due.entity';

@Module({
  controllers: [DuesController],
  imports: [
    TypeOrmModule.forFeature([DueEntity]),
    AssociatesModule,
    OrganizationsModule,
  ],
  providers: [DuesService, TenantGuard],
})
export class DuesModule {}
