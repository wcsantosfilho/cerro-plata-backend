import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { AssociateService } from './associate.service';
import { AssociateDto, AssociateRouteParameters } from './associate.dto';

@Controller('associate')
export class AssociateController {
  constructor(private readonly associatesService: AssociateService) {}

  @Post()
  async create(@Body() associate: AssociateDto): Promise<AssociateDto> {
    return await this.associatesService.create(associate);
  }

  @Put('/:id')
  async update(
    @Param() params: AssociateRouteParameters,
    @Body() associate: AssociateDto,
  ) {
    await this.associatesService.update(params.id, associate);
  }
}
