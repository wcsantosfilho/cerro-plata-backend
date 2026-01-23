import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';
import { ApiPaginationQueries } from '../../../common/decorators/api/api-pagination.doc';
import { ApiSortingQueries } from '../../../common/decorators/api/api-sorting.doc';

export function ApiFindAllAssociatesDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all associates' }),
    ApiResponse({
      status: 200,
      description:
        'Paginated list of associates retrieved successfully. Returns { items, total }.',
    }),
    ApiQuery({
      name: 'name',
      required: false,
      description: 'Filtra pelo nome do associado',
      example: 'Margie',
    }),
    ApiQuery({
      name: 'associationrecord',
      required: false,
      description: 'Filtra pela matrícula do associado',
      example: '1010',
    }),
    ApiQuery({
      name: 'type',
      required: false,
      description: 'Filtra pelo tipo de associado',
      enum: [
        'FOUNDER',
        'REDEEMED',
        'BENEMERIT',
        'HONORARY',
        'SENIOR',
        'CONTRIBUTING',
        'COLABORATOR',
      ],
      example: 'FOUNDER',
    }),
    ApiPaginationQueries(),
    ApiCommonErrors(),
    ApiSortingQueries(),
  );
}
