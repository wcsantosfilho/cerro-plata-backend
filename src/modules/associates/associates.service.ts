import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssociateEntity } from '../../db/entities/associate.entity';
import {
  AssociateDto,
  AssociateTypeEnum,
  FindAllParameters,
} from './associate.dto';

@Injectable()
export class AssociatesService {
  constructor(
    @InjectRepository(AssociateEntity)
    private readonly associateRepository: Repository<AssociateEntity>,
  ) {}

  async create(associate: AssociateDto): Promise<AssociateDto> {
    const typeKey = associate.type as keyof typeof AssociateTypeEnum;
    const associateToSave: Partial<AssociateEntity> = {
      associationRecord: associate.associationRecord,
      name: associate.name,
      phoneNumber: associate.phoneNumber,
      address: associate.address,
      type: AssociateTypeEnum[typeKey],
    };

    const existingAssociate = await this.findByAssociationRecord(
      associate.associationRecord,
    );
    if (existingAssociate) {
      throw new HttpException(
        `Associate with associationRecord: ${associate.associationRecord} already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdAssociate =
      await this.associateRepository.save(associateToSave);
    return this.mapEntityToDto(createdAssociate);
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

    if (associate.associationRecord !== foundAssociate.associationRecord) {
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

    await this.associateRepository.update(id, this.mapDtoToEntity(associate));
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

  private mapEntityToDto(associateEntity: AssociateEntity): AssociateDto {
    const typeKey = associateEntity.type as keyof typeof AssociateTypeEnum;
    return {
      id: associateEntity.id,
      associationRecord: associateEntity.associationRecord,
      name: associateEntity.name,
      phoneNumber: associateEntity.phoneNumber,
      address: associateEntity.address,
      type: AssociateTypeEnum[typeKey],
      createdAt: associateEntity.createdAt,
      updatedAt: associateEntity.updatedAt,
    };
  }

  private mapDtoToEntity(associateDto: AssociateDto): Partial<AssociateEntity> {
    return {
      id: associateDto.id,
      associationRecord: associateDto.associationRecord,
      name: associateDto.name,
      phoneNumber: associateDto.phoneNumber,
      address: associateDto.address,
      type: associateDto.type.toString(),
    };
  }
}
