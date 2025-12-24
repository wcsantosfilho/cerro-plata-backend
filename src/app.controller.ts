import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

@ApiTags('app')
@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  @ApiExcludeEndpoint()
  getMain(): string {
    return this.appService.getMain();
  }

  @Get('health')
  health(): string {
    return this.appService.getHealth();
  }
}
