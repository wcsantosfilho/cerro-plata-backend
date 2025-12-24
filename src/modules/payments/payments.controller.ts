import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import {
  AssociateRouteParameters,
  PaymentDto,
  FindAllParameters,
} from './payment.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ApiCreatePaymentDocs } from './docs/create-payment.doc';
import { ApiFindAllPaymentsDocs } from './docs/find-all-payment.docs';
import { ApiFindByAssociateDocs } from './docs/find-by-associate-payment.doc';

@ApiTags('payments')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiCreatePaymentDocs()
  async create(@Body() payment: PaymentDto): Promise<PaymentDto> {
    return await this.paymentsService.create(payment);
  }

  @Get()
  @ApiFindAllPaymentsDocs()
  async findAll(
    @Query() params: FindAllParameters,
  ): Promise<{ items: PaymentDto[]; total: number }> {
    return await this.paymentsService.findAll(params);
  }

  @Get('/associate/:associateId')
  @ApiFindByAssociateDocs()
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
