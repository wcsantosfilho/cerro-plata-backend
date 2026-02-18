import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationEntity } from '../../db/entities/organization.entity';

@Module({
  controllers: [OrganizationsController],
  imports: [TypeOrmModule.forFeature([OrganizationEntity])],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
