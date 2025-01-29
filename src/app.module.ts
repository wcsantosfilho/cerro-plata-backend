import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserControler } from './users.controller';
import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [AppController, UserControler],
  providers: [AppService, UserService],
})
export class AppModule {}
