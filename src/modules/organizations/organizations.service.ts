import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationEntity } from '../../db/entities/organization.entity';
import { OrganizationDto } from './organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
  ) {}

  async create(organization: OrganizationEntity): Promise<OrganizationEntity> {
    const organizationToSave: Partial<OrganizationEntity> = {
      organization_name: organization.organization_name,
    };

    const createdOrganization =
      await this.organizationRepository.save(organizationToSave);
    return this.mapEntityToDto(createdOrganization);
  }

  async findOrganizationByIdOrFail(id: string): Promise<OrganizationEntity> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });
    if (!organization) {
      throw new HttpException(
        `Organization with id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return organization;
  }

  async findById(id: string): Promise<OrganizationEntity> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });
    if (!organization) {
      throw new HttpException(
        `Organization with id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return organization;
  }

  async findByTenant(tenantId: string): Promise<OrganizationEntity> {
    const organization = await this.organizationRepository.findOne({
      where: { id: tenantId },
    });
    if (!organization) {
      throw new HttpException(
        `Organization with id: ${tenantId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return organization;
  }

  getProfile(user: string) {
    // user info available here
    return user;
  }

  private mapEntityToDto(
    organizationEntity: OrganizationEntity,
  ): OrganizationDto {
    return {
      id: organizationEntity.id,
      organization_name: organizationEntity.organization_name,
      createdAt: organizationEntity.createdAt,
      updatedAt: organizationEntity.updatedAt,
    };
  }
}
