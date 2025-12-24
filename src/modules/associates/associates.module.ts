import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociatesService } from './associates.service';
import { AssociatesController } from './associates.controller';
import { AssociateEntity } from '../../db/entities/associate.entity';

@Module({
  controllers: [AssociatesController],
  imports: [TypeOrmModule.forFeature([AssociateEntity])],
  providers: [AssociatesService],
  exports: [AssociatesService],
})
export class AssociatesModule {}
