import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentEntity } from '../../db/entities/payment.entity';
import { AssociatesModule } from '../associates/associates.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { TenantGuard } from '../../common/tenant/tenant.guard';
import { DuesModule } from '../dues/dues.module';

@Module({
  controllers: [PaymentsController],
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    AssociatesModule,
    OrganizationsModule,
    forwardRef(() => DuesModule),
  ],
  providers: [PaymentsService, TenantGuard],
})
export class PaymentsModule {}
