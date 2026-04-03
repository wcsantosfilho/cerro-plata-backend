import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DueEntity } from '../../db/entities/due.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { AssociatesService } from '../associates/associates.service';
import {
  DueDto,
  PaymentTypeEnum,
  FindAllParameters,
  PaymentPlanEnum,
} from './due.dto';

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

    const typeKey = due.type as keyof typeof PaymentTypeEnum;
    const paymentPlanKey = due.paymentPlan as keyof typeof PaymentPlanEnum;
    const dueToSave: Partial<DueEntity> = {
      associate: associate,
      organization: organization,
      dueDate: due.dueDate,
      description: due.description,
      amount: due.amount,
      type: PaymentTypeEnum[typeKey],
      paymentPlan: PaymentPlanEnum[paymentPlanKey],
    };

    const createdDue = await this.dueRepository.save(dueToSave);
    return this.mapEntityToDto(createdDue);
  }

  async generateDues(tenantId: string): Promise<DueDto> {
    // Busca a organização para garantir que existe
    let organization;
    if (tenantId) {
      organization =
        await this.organizationsService.findOrganizationByIdOrFail(tenantId);
    }

    // Regra de Negócio: Verifica se a Organization existe
    if (tenantId && !organization) {
      throw new HttpException(
        `Organization with id: ${tenantId} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log('Gerando dues para organização:', tenantId);
    const dueToSave: Partial<DueEntity> = {
      //   associate: associateToSave,
      //   organizationId: organization?.id,
      //   dueDate: due.dueDate,
      //   description: due.description,
      //   amount: due.amount,
      //   type: PaymentTypeEnum[typeKey],
    };

    const createdDue = await this.dueRepository.save(dueToSave);
    return this.mapEntityToDto(createdDue);
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
    return {
      id: dueEntity.id,
      associateId: dueEntity.associate ? dueEntity.associate.id : undefined,
      organizationId: dueEntity.organization.id,
      dueDate: dueEntity.dueDate,
      description: dueEntity.description,
      amount: dueEntity.amount,
      type: PaymentTypeEnum[typeKey],
      paymentPlan: PaymentPlanEnum[paymentPlanKey],
      createdAt: dueEntity.createdAt,
      updatedAt: dueEntity.updatedAt,
    };
  }
}
