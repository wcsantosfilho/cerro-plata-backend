import { Module } from '@nestjs/common';
import { AssociatesService } from './associates.service';
import { AssociatesController } from './associates.controller';
import { AssociateEntity } from 'src/db/entities/associate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [AssociatesController],
  imports: [TypeOrmModule.forFeature([AssociateEntity])],
  providers: [AssociatesService],
})
export class AssociatesModule {}
