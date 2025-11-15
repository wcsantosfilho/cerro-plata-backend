import { Body, Controller, Post } from '@nestjs/common';
import { AssociateService } from './associate.service';
import { AssociateDto } from './associate.dto';

@Controller('associate')
export class AssociateController {
  constructor(private readonly associatesService: AssociateService) {}

  @Post()
  async create(@Body() associate: AssociateDto): Promise<AssociateDto> {
    return await this.associatesService.create(associate);
  }
}
