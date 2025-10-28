import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  getMain(): string {
    return this.appService.getMain();
  }

  @Get('health')
  health(): string {
    return this.appService.getHealth();
  }
}
