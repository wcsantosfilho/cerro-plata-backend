import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AssociatesService } from './associates.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  AssociateDto,
  AssociateRouteParameters,
  FindAllParameters,
} from './associate.dto';

@ApiTags('associates')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
@Controller('associates')
export class AssociatesController {
  constructor(private readonly associatesService: AssociatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new associate' })
  @ApiResponse({
    status: 201,
    description: 'The associate has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body() associate: AssociateDto): Promise<AssociateDto> {
    return await this.associatesService.create(associate);
  }

  @Get()
  @ApiOperation({ summary: 'Get all associates' })
  @ApiResponse({
    status: 200,
    description: 'List of associates retrieved successfully.',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filtra pelo nome do associado',
    example: 'Margie',
  })
  @ApiQuery({
    name: 'associationrecord',
    required: false,
    description: 'Filtra pela matrícula do associado',
    example: '1010',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filtra pelo tipo de associado',
    enum: ['REGULAR', 'REDEEMED', 'FOUNDER'],
  })
  async findAll(@Query() params: FindAllParameters): Promise<AssociateDto[]> {
    return await this.associatesService.findAll(params);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get an associate by ID' })
  @ApiResponse({
    status: 200,
    description: 'Associate successfully retrieved.',
  })
  @ApiResponse({
    status: 404,
    description: 'Associate not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Request parameters are invalid.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filtra pelo tipo de associado',
    enum: ['REGULAR', 'REDEEMED', 'FOUNDER'],
  })
  async findById(
    @Param() params: AssociateRouteParameters,
  ): Promise<AssociateDto | null> {
    return await this.associatesService.findById(params.id);
  }

  @Put('/:id')
  async update(
    @Param() params: AssociateRouteParameters,
    @Body() associate: AssociateDto,
  ) {
    await this.associatesService.update(params.id, associate);
  }
}
