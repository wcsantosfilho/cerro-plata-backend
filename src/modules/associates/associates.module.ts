import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociatesService } from './associates.service';
import { AssociatesController } from './associates.controller';
import { AssociateEntity } from '../../db/entities/associate.entity';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  controllers: [AssociatesController],
  imports: [TypeOrmModule.forFeature([AssociateEntity]), OrganizationsModule],
  providers: [AssociatesService],
  exports: [AssociatesService],
})
export class AssociatesModule {}
