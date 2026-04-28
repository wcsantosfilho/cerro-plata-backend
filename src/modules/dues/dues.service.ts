import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DueEntity } from '../../db/entities/due.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { AssociatesService } from '../associates/associates.service';
import {
  DueDto,
  GenerateDuesDto,
  PaymentTypeEnum,
  FindAllParameters,
  PaymentPlanEnum,
} from './due.dto';
import { Decimal } from 'decimal.js';

@Injectable()
export class DuesService {
  constructor(
    @InjectRepository(DueEntity)
    private readonly dueRepository: Repository<DueEntity>,
    private readonly organizationsService: OrganizationsService,
    private readonly associatesService: AssociatesService,
  ) {}

  async create(due: DueDto): Promise<DueDto> {
    // Busca a organização para garantir que existe
    let organization;
    if (due.organizationId) {
      organization = await this.organizationsService.findOrganizationByIdOrFail(
        due.organizationId,
      );
    }

    // Busca o associado para garantir que existe
    let associate = null;
    if (due.associateId) {
      associate = await this.associatesService.findAssociateByIdOrFail(
        due.associateId,
      );
    }

    // Regra de Negócio: Verifica se a Organization existe
    if (due.organizationId && !organization) {
      throw new HttpException(
        `Organization with id: ${due.organizationId} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Regra de negócio: Obrigação (Due) do tipo MEMBERSHIP_FEE deve ter um associateId associado
    if (
      (due.type as PaymentTypeEnum) === PaymentTypeEnum.MEMBERSHIP_FEE &&
      !due.associateId
    ) {
      throw new HttpException(
        'MEMBERSHIP_FEES dues must have an associated associateId',
        HttpStatus.BAD_REQUEST,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const amountToSave = new Decimal(due.amount);

    const typeKey = due.type as keyof typeof PaymentTypeEnum;
    const paymentPlanKey = due.paymentPlan as keyof typeof PaymentPlanEnum;
    const dueToSave: Partial<DueEntity> = {
      associate: associate,
      organization: organization,
      dueDate: due.dueDate,
      description: due.description,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      amount: amountToSave.toNumber(),
      type: PaymentTypeEnum[typeKey],
      paymentPlan: PaymentPlanEnum[paymentPlanKey],
    };

    const createdDue = await this.dueRepository.save(dueToSave);
    return this.mapEntityToDto(createdDue);
  }

  async generateDues(
    tenantId: string,
    params: GenerateDuesDto,
  ): Promise<DueDto[]> {
    const organization =
      await this.organizationsService.findOrganizationByIdOrFail(tenantId);

    const [yearStr, monthStr] = params.referenceMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    this.validatePaymentPlanMonth(
      params.paymentPlan as PaymentPlanEnum,
      month,
    );

    const eligibleAssociates = await this.associatesService.findEligibleForDues(
      tenantId,
      params.paymentPlan,
    );

    const dueDate = this.getLastDayOfMonth(year, month);
    const description = this.buildDescription(
      params.paymentPlan as PaymentPlanEnum,
      month,
      year,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const amount = new Decimal(params.amount).toNumber();

    const createdDues: DueDto[] = [];
    for (const associate of eligibleAssociates) {
      const alreadyHasDue = await this.hasExistingDueForMonth(
        associate.id!,
        tenantId,
        year,
        month,
      );
      if (alreadyHasDue) continue;

      const dueToSave: Partial<DueEntity> = {
        associate,
        organization,
        dueDate,
        description,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        amount,
        type: PaymentTypeEnum.MEMBERSHIP_FEE,
        paymentPlan:
          PaymentPlanEnum[params.paymentPlan as keyof typeof PaymentPlanEnum],
      };

      const created = await this.dueRepository.save(dueToSave);
      createdDues.push(this.mapEntityToDto(created));
    }

    return createdDues;
  }

  private validatePaymentPlanMonth(
    paymentPlan: PaymentPlanEnum,
    month: number,
  ): void {
    if (
      paymentPlan === PaymentPlanEnum.QUARTERLY &&
      ![1, 4, 7, 10].includes(month)
    ) {
      throw new HttpException(
        'QUARTERLY dues can only be generated in January, April, July, or October',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      paymentPlan === PaymentPlanEnum.SEMIANNUAL &&
      ![1, 7].includes(month)
    ) {
      throw new HttpException(
        'SEMIANNUAL dues can only be generated in January or July',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (paymentPlan === PaymentPlanEnum.ANNUAL && month !== 1) {
      throw new HttpException(
        'ANNUAL dues can only be generated in January',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async hasExistingDueForMonth(
    associateId: string,
    organizationId: string,
    year: number,
    month: number,
  ): Promise<boolean> {
    const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
    const startOfNextMonth =
      month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const existing = await this.dueRepository
      .createQueryBuilder('due')
      .where('due.associate_id = :associateId', { associateId })
      .andWhere('due.organization_id = :organizationId', { organizationId })
      .andWhere(
        'due.due_date >= :startOfMonth AND due.due_date < :startOfNextMonth',
        { startOfMonth, startOfNextMonth },
      )
      .getOne();

    return existing !== null;
  }

  private getLastDayOfMonth(year: number, month: number): string {
    return new Date(Date.UTC(year, month, 0)).toISOString();
  }

  private buildDescription(
    paymentPlan: PaymentPlanEnum,
    month: number,
    year: number,
  ): string {
    const mm = String(month).padStart(2, '0');
    switch (paymentPlan) {
      case PaymentPlanEnum.QUARTERLY:
        return `Trimestralidade ${mm}/${year}`;
      case PaymentPlanEnum.SEMIANNUAL:
        return `Semestralidade ${mm}/${year}`;
      case PaymentPlanEnum.ANNUAL:
        return `Anuidade ${year}`;
      default:
        return `Mensalidade ${mm}/${year}`;
    }
  }

  async findDueByIdOrFail(id: string): Promise<DueEntity> {
    const due = await this.dueRepository.findOne({
      where: { id },
      relations: ['associate', 'organization', 'payments'],
    });
    if (!due) {
      throw new HttpException(
        `Due with id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return due;
  }

  async findAll(
    tenantId: string,
    queryParams: FindAllParameters,
  ): Promise<{
    items: DueDto[];
    total: number;
  }> {
    const organizationId = tenantId;
    const query = this.dueRepository
      .createQueryBuilder('due')
      .innerJoinAndSelect('due.organization', 'organization')
      .leftJoinAndSelect('due.associate', 'associate');

    if (organizationId) {
      query.andWhere('due.organization_id = :organizationId', {
        organizationId,
      });
    }

    if (queryParams?.dueDate) {
      query.andWhere('due.effective_date = :effectiveDate', {
        effectiveDate: queryParams.dueDate,
      });
    }

    if (queryParams?.type) {
      query.andWhere('due.type = :type', {
        type: queryParams.type,
      });
    }

    // sorting
    if (queryParams?.sortBy) {
      const validatedSortFields = this.dueRepository.metadata.columns.map(
        (col) => col.propertyName,
      );
      if (!validatedSortFields.includes(queryParams.sortBy || '')) {
        throw new HttpException('Invalid sortBy field', HttpStatus.BAD_REQUEST);
      }
      const sortOrder =
        queryParams?.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      query.orderBy(`due.${queryParams.sortBy}`, sortOrder);
    } else {
      query.orderBy('due.createdAt', 'DESC');
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

  private mapEntityToDto(dueEntity: DueEntity): DueDto {
    const typeKey = dueEntity.type as keyof typeof PaymentTypeEnum;
    const paymentPlanKey =
      dueEntity.paymentPlan as keyof typeof PaymentPlanEnum;
    // paymentEntity.amount in create is a number, but in query is a string, so we need to convert it to Decimal first and then to string with 2 decimal places
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const stringedAmount = new Decimal(dueEntity.amount).toFixed(2);

    return {
      id: dueEntity.id,
      associateId: dueEntity.associate ? dueEntity.associate.id : undefined,
      organizationId: dueEntity.organization.id,
      dueDate: dueEntity.dueDate,
      description: dueEntity.description,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      amount: stringedAmount,
      type: PaymentTypeEnum[typeKey],
      paymentPlan: PaymentPlanEnum[paymentPlanKey],
      createdAt: dueEntity.createdAt,
      updatedAt: dueEntity.updatedAt,
    };
  }
}
