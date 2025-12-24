import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AssociatesService } from './associates.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import {
  AssociateDto,
  AssociateRouteParameters,
  FindAllParameters,
} from './associate.dto';
import { ApiCreateAssociateDoc } from './docs/create-associate.doc';
import { ApiFindAllAssociatesDoc } from './docs/find-all-associate.docs';
import { ApiFindByIdAssociateDoc } from './docs/find-by-id-associate.doc';
import { ApiUpdateAssociateDoc } from './docs/update-associate.doc';

@ApiTags('associates')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
@Controller('associates')
export class AssociatesController {
  constructor(private readonly associatesService: AssociatesService) {}

  @Post()
  @ApiCreateAssociateDoc()
  async create(@Body() associate: AssociateDto): Promise<AssociateDto> {
    return await this.associatesService.create(associate);
  }

  @Get()
  @ApiFindAllAssociatesDoc()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @Query() params: FindAllParameters,
  ): Promise<{ items: AssociateDto[]; total: number }> {
    return await this.associatesService.findAll(params);
  }

  @Get('/:id')
  @ApiFindByIdAssociateDoc()
  async findById(
    @Param() params: AssociateRouteParameters,
  ): Promise<AssociateDto | null> {
    return await this.associatesService.findById(params.id);
  }

  @Put('/:id')
  @ApiUpdateAssociateDoc()
  async update(
    @Param() params: AssociateRouteParameters,
    @Body() associate: AssociateDto,
  ) {
    await this.associatesService.update(params.id, associate);
  }
}
