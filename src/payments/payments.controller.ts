import { Controller, Body, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PaymentDto } from './payment.dto';
import { PaymentsService } from '../payments/payments.service';

@UseGuards(AuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Body() payment: PaymentDto): Promise<PaymentDto> {
    return await this.paymentsService.create(payment);
  }
}
