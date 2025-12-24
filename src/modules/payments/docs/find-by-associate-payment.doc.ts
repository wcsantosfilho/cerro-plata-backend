import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';
import { ApiPaginationQueries } from 'src/common/decorators/api/api-pagination.doc';

export function ApiFindByAssociateDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Find payments by associate' }),
    ApiResponse({
      status: 200,
      description:
        'Paginated list of payments retrieved successfully. Returns { items, total }.',
    }),
    ApiResponse({ status: 404, description: 'Associate not found.' }),
    ApiParam({
      name: 'associateId',
      description: 'ID of the associate',
      example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    }),
    ApiQuery({
      name: 'effectiveDate',
      required: false,
      description: 'Filter per effective date',
      example: '2025-01-10T22:32:00.000Z',
    }),
    ApiQuery({
      name: 'type',
      required: false,
      description: 'Filter by payment type',
      enum: ['COURSE', 'MEMBERSHIP_FEE', 'SHOP'],
      example: 'SHOP',
    }),
    ApiPaginationQueries(),
    ApiCommonErrors(),
  );
}
