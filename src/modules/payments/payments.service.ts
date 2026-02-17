import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../db/entities/payment.entity';
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
    if (
      (payment.type as PaymentTypeEnum) === PaymentTypeEnum.MEMBERSHIP_FEE &&
      !payment.associateId
    ) {
      throw new HttpException(
        'MEMBERSHIP_FEES payments must have an associated associateId',
        HttpStatus.BAD_REQUEST,
      );
    }

    let associate = null;
    if (payment.associateId) {
      associate = await this.associatesService.findAssociateByIdOrFail(
        payment.associateId,
      );
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
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.associate', 'associate');

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

    // sorting
    if (queryParams?.sortBy) {
      const validatedSortFields = this.paymentRepository.metadata.columns.map(
        (col) => col.propertyName,
      );
      if (!validatedSortFields.includes(queryParams.sortBy || '')) {
        throw new HttpException('Invalid sortBy field', HttpStatus.BAD_REQUEST);
      }
      const sortOrder =
        queryParams?.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      query.orderBy(`payment.${queryParams.sortBy}`, sortOrder);
    } else {
      query.orderBy('payment.createdAt', 'DESC');
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

  async findByAssociate(
    associateId: string,
    queryParams: FindAllParameters,
  ): Promise<{ items: PaymentDto[]; total: number }> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.associate', 'associate')
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

    // sorting
    if (queryParams?.sortBy) {
      const validatedSortFields = this.paymentRepository.metadata.columns.map(
        (col) => col.propertyName,
      );
      if (!validatedSortFields.includes(queryParams.sortBy || '')) {
        throw new HttpException('Invalid sortBy field', HttpStatus.BAD_REQUEST);
      }
      const sortOrder =
        queryParams?.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      query.orderBy(`payment.${queryParams.sortBy}`, sortOrder);
    } else {
      query.orderBy('payment.createdAt', 'DESC');
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
