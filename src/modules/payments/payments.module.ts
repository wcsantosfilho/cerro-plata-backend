import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentEntity } from '../../db/entities/payment.entity';
import { AssociatesModule } from '../associates/associates.module';

@Module({
  controllers: [PaymentsController],
  imports: [TypeOrmModule.forFeature([PaymentEntity]), AssociatesModule],
  providers: [PaymentsService],
})
export class PaymentsModule {}
