import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentEntity } from '../../db/entities/payment.entity';
import { AssociatesModule } from '../associates/associates.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { TenantGuard } from '../../common/tenant/tenant.guard';

@Module({
  controllers: [PaymentsController],
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    AssociatesModule,
    OrganizationsModule,
  ],
  providers: [PaymentsService, TenantGuard],
})
export class PaymentsModule {}
