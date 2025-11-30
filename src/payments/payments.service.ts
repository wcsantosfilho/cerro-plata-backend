import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../db/entities/payment.entity';
import { PaymentDto, PaymentTypeEnum } from './payment.dto';
import { AssociatesService } from '../associates/associates.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    private readonly associatesService: AssociatesService,
  ) {}

  async create(payment: PaymentDto): Promise<PaymentDto> {
    let associate = null;
    if (payment.associateId) {
      associate = await this.associatesService.findById(payment.associateId);
      if (!associate) {
        throw new Error(`Associate with id ${payment.associateId} not found`);
      }
    }
    const typeKey = payment.type as keyof typeof PaymentTypeEnum;
    const paymentToSave: Partial<PaymentEntity> = {
      associate: associate,
      effectiveDate: payment.effectiveDate,
      dueDate: payment.dueDate,
      description: payment.description,
      amount: payment.amount,
      type: PaymentTypeEnum[typeKey],
    };

    const createdPayment = await this.paymentRepository.save(paymentToSave);
    return this.mapEntityToDto(createdPayment);
  }

  private mapEntityToDto(paymentEntity: PaymentEntity): PaymentDto {
    const typeKey = paymentEntity.type as keyof typeof PaymentTypeEnum;
    return {
      id: paymentEntity.id,
      associateId: paymentEntity.associate
        ? paymentEntity.associate.id
        : undefined,
      effectiveDate: paymentEntity.effectiveDate,
      dueDate: paymentEntity.dueDate,
      description: paymentEntity.description,
      amount: paymentEntity.amount,
      type: PaymentTypeEnum[typeKey],
      createdAt: paymentEntity.createdAt,
      updatedAt: paymentEntity.updatedAt,
    };
  }
}
