import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssociateEntity } from '../../db/entities/associate.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import {
  AssociateDto,
  AssociateTypeEnum,
  FindAllParameters,
  PaymentPlanEnum,
  AssociateCategoryEnum,
  BloodTypeEnum,
} from './associate.dto';
import { validateCPF } from '../../common/validatecpf';

@Injectable()
export class AssociatesService {
  constructor(
    @InjectRepository(AssociateEntity)
    private readonly associateRepository: Repository<AssociateEntity>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(associate: AssociateDto): Promise<AssociateDto> {
    const typeKey = associate.type as keyof typeof AssociateTypeEnum;
    const categoryKey =
      associate.category as keyof typeof AssociateCategoryEnum;
    const paymentPlanKey =
      associate.paymentPlan as keyof typeof PaymentPlanEnum;
    const bloodKey = associate.bloodType as keyof typeof BloodTypeEnum;

    let organization;
    if (associate.organizationId) {
      organization = await this.organizationsService.findOrganizationByIdOrFail(
        associate.organizationId,
      );
    }

    const associateToSave: Partial<AssociateEntity> = {
      associationRecord: associate.associationRecord,
      organization: organization,
      cpf: associate.cpf,
      name: associate.name,
      phoneNumber: associate.phoneNumber,
      emergencyPhoneNumber: associate.emergencyPhoneNumber,
      address: associate.address,
      type: AssociateTypeEnum[typeKey],
      category: AssociateCategoryEnum[categoryKey],
      paymentPlan: PaymentPlanEnum[paymentPlanKey],
      bloodType: BloodTypeEnum[bloodKey],
      birthDate: associate.birthDate,
      associationDate: associate.associationDate,
      fepamRegistrationNumber: associate.fepamRegistrationNumber,
      fepamDueDate: associate.fepamDueDate,
    };

    // Regra de Negócio: Se o associationRecord for fornecido, verificar se já existe
    if (
      associateToSave.associationRecord != undefined &&
      typeof associateToSave.associationRecord === 'string'
    ) {
      const existingAssociate = await this.findByAssociationRecord(
        associateToSave.associationRecord,
      );
      if (existingAssociate) {
        throw new HttpException(
          `Associate with associationRecord: ${associateToSave.associationRecord} already exists`,
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      // Regra de Negócio: Se o associationRecord não for fornecido, adicionar um ao último existente
      const lastAssociateRecord = await this.findLastAssociationRecord();
      const newAssociateRecord = lastAssociateRecord
        ? (parseInt(lastAssociateRecord) + 1).toString()
        : '1';
      associateToSave.associationRecord = newAssociateRecord;
    }

    // Regra de Negócio: Se o CPF for fornecido, verificar se já existe e se é valido
    if (
      associateToSave.cpf != undefined &&
      typeof associateToSave.cpf === 'string'
    ) {
      // É válido?
      const isValid = validateCPF(associateToSave.cpf);
      if (!isValid) {
        throw new HttpException(
          `CPF: ${associateToSave.cpf} is not valid`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      // Já existe?
      const existingAssociate = await this.findByCPF(associateToSave.cpf);
      if (existingAssociate) {
        throw new HttpException(
          `Associate with CPF: ${associateToSave.cpf} already exists`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const createdAssociate =
      await this.associateRepository.save(associateToSave);
    return this.mapEntityToDto(createdAssociate);
  }

  async update(id: string, associate: AssociateDto) {
    const foundAssociate = await this.associateRepository.findOne({
      where: { id },
    });

    if (!foundAssociate) {
      throw new HttpException(
        `Associate with id: ${id} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Regra de Negócio: Verificar duplicidade de associationRecord se for alterado
    if (
      associate.associationRecord &&
      associate.associationRecord !== foundAssociate.associationRecord
    ) {
      const existingAssociate = await this.findByAssociationRecord(
        associate.associationRecord,
      );
      if (existingAssociate) {
        throw new HttpException(
          `Associate with associationRecord: ${associate.associationRecord} already exists`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // É válido?
    if (associate.cpf) {
      const isValid = validateCPF(associate.cpf);
      if (!isValid) {
        throw new HttpException(
          `CPF: ${associate.cpf} is not valid`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    // Regra de Negócio: Verificar duplicidade de CPF se for alterado
    if (associate.cpf && associate.cpf !== foundAssociate.cpf) {
      const existingAssociate = await this.findByCPF(associate.cpf);
      if (existingAssociate) {
        throw new HttpException(
          `Associate with CPF: ${associate.cpf} already exists`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    await this.associateRepository.update(id, this.mapDtoToEntity(associate));
  }

  async findAll(
    queryParams: FindAllParameters,
  ): Promise<{ items: AssociateDto[]; total: number }> {
    const query = this.associateRepository.createQueryBuilder('associate');

    if (queryParams?.name) {
      query.andWhere('associate.name ILIKE :name', {
        name: `%${queryParams.name}%`,
      });
    }
    if (queryParams?.type) {
      query.andWhere('associate.type = :type', { type: queryParams.type });
    }
    if (queryParams?.associationrecord) {
      query.andWhere('associate.associationRecord = :associationRecord', {
        associationRecord: `${queryParams.associationrecord}`,
      });
    }

    // sorting
    if (queryParams?.sortBy) {
      const validColumns = this.associateRepository.metadata.columns.map(
        (col) => col.propertyName,
      );
      if (!validColumns.includes(queryParams?.sortBy || '')) {
        throw new HttpException('Invalid sortBy field', HttpStatus.BAD_REQUEST);
      }
      const sortOrder =
        queryParams.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      query.orderBy(`associate.${queryParams.sortBy}`, sortOrder);
    } else {
      query.orderBy('associate.createdAt', 'DESC'); // default sorting
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

    const items = entities.map((associateEntity) =>
      this.mapEntityToDto(associateEntity),
    );

    return { items, total };
  }

  async findById(id: string): Promise<AssociateDto | null> {
    const associateFound = await this.associateRepository.findOne({
      where: { id },
    });

    if (!associateFound) {
      throw new HttpException(
        `Associate with id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.mapEntityToDto(associateFound);
  }

  async findByAssociationRecord(
    associationRecord: string,
  ): Promise<AssociateDto | null> {
    const associateFound = await this.associateRepository.findOne({
      where: { associationRecord },
    });

    if (!associateFound) {
      return null;
    }

    return this.mapEntityToDto(associateFound);
  }

  async findByCPF(cpf: string): Promise<AssociateDto | null> {
    const associateFound = await this.associateRepository.findOne({
      where: { cpf },
    });

    if (!associateFound) {
      return null;
    }

    return this.mapEntityToDto(associateFound);
  }

  async findLastAssociationRecord(): Promise<string | null> {
    const associateFound = await this.associateRepository.findOne({
      where: {},
      order: {
        associationRecord: 'DESC',
      },
    });

    const lastValue = associateFound ? associateFound.associationRecord : null;
    return lastValue;
  }

  async findAssociateByIdOrFail(id: string): Promise<AssociateEntity> {
    const associateFound = await this.associateRepository.findOne({
      where: { id },
    });

    if (!associateFound) {
      throw new HttpException(
        `Associate with id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return associateFound;
  }

  private mapEntityToDto(associateEntity: AssociateEntity): AssociateDto {
    const typeKey = associateEntity.type as keyof typeof AssociateTypeEnum;
    const categoryKey =
      associateEntity.category as keyof typeof AssociateCategoryEnum;
    const paymentPlanKey =
      associateEntity.paymentPlan as keyof typeof PaymentPlanEnum;
    const bloodKey = associateEntity.bloodType as keyof typeof BloodTypeEnum;
    return {
      id: associateEntity.id,
      organizationId: associateEntity.organization.id,
      associationRecord: associateEntity.associationRecord,
      cpf: associateEntity.cpf,
      name: associateEntity.name,
      phoneNumber: associateEntity.phoneNumber,
      emergencyPhoneNumber: associateEntity.emergencyPhoneNumber,
      email: associateEntity.email,
      address: associateEntity.address,
      type: AssociateTypeEnum[typeKey],
      category: AssociateCategoryEnum[categoryKey],
      paymentPlan: PaymentPlanEnum[paymentPlanKey],
      bloodType: BloodTypeEnum[bloodKey],
      birthDate: associateEntity.birthDate,
      associationDate: associateEntity.associationDate,
      fepamRegistrationNumber: associateEntity.fepamRegistrationNumber,
      fepamDueDate: associateEntity.fepamDueDate,
      createdAt: associateEntity.createdAt,
      updatedAt: associateEntity.updatedAt,
    };
  }

  private mapDtoToEntity(associateDto: AssociateDto): Partial<AssociateEntity> {
    return {
      id: associateDto.id,
      associationRecord: associateDto.associationRecord,
      cpf: associateDto.cpf,
      name: associateDto.name,
      phoneNumber: associateDto.phoneNumber,
      emergencyPhoneNumber: associateDto.emergencyPhoneNumber,
      email: associateDto.email,
      address: associateDto.address,
      type: associateDto.type.toString(),
      category: associateDto.category.toString(),
      paymentPlan: associateDto.paymentPlan.toString(),
      bloodType: associateDto.bloodType.toString(),
      birthDate: associateDto.birthDate,
      associationDate: associateDto.associationDate,
      fepamRegistrationNumber: associateDto.fepamRegistrationNumber,
      fepamDueDate: associateDto.fepamDueDate,
    };
  }
}
