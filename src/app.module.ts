import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './task/task.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { AssociateModule } from './associate/associate.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TaskModule,
    UsersModule,
    AuthModule,
    DbModule,
    AssociateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
