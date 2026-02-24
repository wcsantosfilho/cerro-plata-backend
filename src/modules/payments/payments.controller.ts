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
import { TenantGuard } from 'src/common/tenant/tenant.guard';
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
import { Tenant } from '../../common/tenant/tenant.decorator';

@ApiTags('payments')
@UseGuards(AuthGuard, TenantGuard)
@ApiBearerAuth('access-token')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiCreatePaymentDocs()
  async create(
    @Tenant() tenantId: string,
    @Body() payment: PaymentDto,
  ): Promise<PaymentDto> {
    return await this.paymentsService.create({
      ...payment,
      organizationId: tenantId,
    });
  }

  @Get()
  @ApiFindAllPaymentsDocs()
  async findAll(
    @Tenant() tenantId: string,
    @Query() params: FindAllParameters,
  ): Promise<{ items: PaymentDto[]; total: number }> {
    return await this.paymentsService.findAll(tenantId, params);
  }

  @Get('/associate/:associateId')
  @ApiFindByAssociateDocs()
  async findByAssociateAndOrganization(
    @Tenant() tenantId: string,
    @Param() params: AssociateRouteParameters,
    @Query() queryParams: FindAllParameters,
  ): Promise<{ items: PaymentDto[]; total: number }> {
    return await this.paymentsService.findByAssociateAndOrganization(
      tenantId,
      params.associateId,
      queryParams,
    );
  }
}
