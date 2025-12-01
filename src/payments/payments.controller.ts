import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import {
  AssociateRouteParameters,
  PaymentDto,
  FindAllParameters,
} from './payment.dto';
import { PaymentsService } from '../payments/payments.service';

@UseGuards(AuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Body() payment: PaymentDto): Promise<PaymentDto> {
    return await this.paymentsService.create(payment);
  }

  @Get()
  async findAll(
    @Query() params: FindAllParameters,
  ): Promise<{ items: PaymentDto[]; total: number }> {
    return await this.paymentsService.findAll(params);
  }

  @Get('/associate/:associateId')
  async findByAssociate(
    @Param() params: AssociateRouteParameters,
    @Query() queryParams: FindAllParameters,
  ): Promise<{ items: PaymentDto[]; total: number }> {
    return await this.paymentsService.findByAssociate(
      params.associateId,
      queryParams,
    );
  }
}
