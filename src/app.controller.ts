import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller("/")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("")
  getMain(): string {
    return this.appService.getMain();
  }

  @Get("hello")
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("health")
  health(): string {
    return this.appService.getHealth();
  }
}
