import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';
import { ApiPaginationQueries } from '../../../common/decorators/api/api-pagination.doc';
import { ApiSortingQueries } from '../../../common/decorators/api/api-sorting.doc';

export function ApiFindAllDueDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Find all dues' }),
    ApiResponse({
      status: 200,
      description:
        'Paginated list of dues retrieved successfully. Returns { items, total }.',
    }),
    ApiQuery({
      name: 'dueDate',
      required: false,
      description: 'Filter per due date',
      example: '2025-01-10T22:32:00.000Z',
    }),
    ApiQuery({
      name: 'type',
      required: false,
      description: 'Filter by due type',
      enum: ['COURSE', 'MEMBERSHIP_FEE', 'SHOP'],
      example: 'SHOP',
    }),
    ApiPaginationQueries(),
    ApiCommonErrors(),
    ApiSortingQueries(),
  );
}
