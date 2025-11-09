import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from 'src/db/entities/task.entity';

@Module({
  controllers: [TaskController],
  imports: [TypeOrmModule.forFeature([TaskEntity])],
  providers: [TaskService],
})
export class TaskModule {}
