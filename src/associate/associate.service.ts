import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssociateEntity } from '../db/entities/associate.entity';
import { AssociateDto, AssociateTypeEnum } from './associate.dto';

@Injectable()
export class AssociateService {
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
        `Associate with id: ${associate.id} not found`,
        HttpStatus.BAD_REQUEST,
      );
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
