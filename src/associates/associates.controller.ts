import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AssociatesService } from './associates.service';
import {
  AssociateDto,
  AssociateRouteParameters,
  FindAllParameters,
} from './associate.dto';

@Controller('associates')
export class AssociatesController {
  constructor(private readonly associatesService: AssociatesService) {}

  @Post()
  async create(@Body() associate: AssociateDto): Promise<AssociateDto> {
    return await this.associatesService.create(associate);
  }

  @Get()
  async findAll(@Query() params: FindAllParameters): Promise<AssociateDto[]> {
    return await this.associatesService.findAll(params);
  }

  @Put('/:id')
  async update(
    @Param() params: AssociateRouteParameters,
    @Body() associate: AssociateDto,
  ) {
    await this.associatesService.update(params.id, associate);
  }
}
