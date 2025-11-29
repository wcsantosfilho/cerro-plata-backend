import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { AssociateEntity } from '../db/entities/associate.entity';
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
    params: FindAllParameters,
  ): Promise<{ items: AssociateDto[]; total: number }> {
    const searchParams: FindOptionsWhere<AssociateEntity> = {};

    if (params?.name) {
      searchParams.name = ILike(`%${params.name}%`);
    }

    if (params?.type) {
      searchParams.type = ILike(`%${params.type}%`);
    }

    if (params?.associationrecord) {
      searchParams.associationRecord = ILike(`%${params.associationrecord}%`);
    }

    // pagination defaults
    const page = params?.page ? Number(params.page) : 1;
    const limit = params?.limit ? Math.min(Number(params.limit), 100) : 10;
    const skip = params?.skip
      ? Number(params.skip)
      : (Math.max(page, 1) - 1) * limit;

    const [entities, total] = await this.associateRepository.findAndCount({
      where: searchParams,
      take: limit,
      skip,
    });

    const items = entities.map((associateEntity) =>
      this.mapEntityToDto(associateEntity),
    );

    return { items, total };
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
