import { Module } from '@nestjs/common';
import { AssociateService } from './associate.service';
import { AssociateController } from './associate.controller';
import { AssociateEntity } from 'src/db/entities/associate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [AssociateController],
  imports: [TypeOrmModule.forFeature([AssociateEntity])],
  providers: [AssociateService],
})
export class AssociateModule {}
