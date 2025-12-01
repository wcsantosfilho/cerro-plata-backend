import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { PaymentEntity } from '../db/entities/payment.entity';
import { PaymentDto, PaymentTypeEnum, FindAllParameters } from './payment.dto';
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

  async findAll(queryParams: FindAllParameters): Promise<{
    items: PaymentDto[];
    total: number;
  }> {
    const searchParams: FindOptionsWhere<PaymentEntity> = {};

    if (queryParams?.effectiveDate) {
      searchParams.effectiveDate = queryParams.effectiveDate;
    }

    if (queryParams?.type) {
      searchParams.type = queryParams.type;
    }

    // pagination defaults
    const page = queryParams?.page ? Number(queryParams.page) : 1;
    const limit = queryParams?.limit
      ? Math.min(Number(queryParams.limit), 100)
      : 10;
    const skip = queryParams?.skip
      ? Number(queryParams.skip)
      : (Math.max(page, 1) - 1) * limit;

    const [entities, total] = await this.paymentRepository.findAndCount({
      where: searchParams,
      take: limit,
      skip,
    });

    const items = entities.map((paymentsEntity) =>
      this.mapEntityToDto(paymentsEntity),
    );

    return { items, total };
  }

  async findByAssociate(
    associateId: string,
    queryParams: FindAllParameters,
  ): Promise<{ items: PaymentDto[]; total: number }> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.associate_id = :associateId', { associateId });

    if (queryParams?.effectiveDate) {
      query.andWhere('payment.effective_date = :effectiveDate', {
        effectiveDate: queryParams.effectiveDate,
      });
    }

    if (queryParams?.type) {
      query.andWhere('payment.type = :type', {
        type: queryParams.type,
      });
    }

    // pagination defaults
    const page = queryParams?.page ? Number(queryParams.page) : 1;
    const limit = queryParams?.limit
      ? Math.min(Number(queryParams.limit), 100)
      : 10;
    const skip = queryParams?.skip
      ? Number(queryParams.skip)
      : (Math.max(page, 1) - 1) * limit;

    const [entities, total] = await query
      .limit(limit)
      .offset(skip)
      .getManyAndCount();

    const items = entities.map((paymentsEntity) =>
      this.mapEntityToDto(paymentsEntity),
    );

    return { items, total };
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
