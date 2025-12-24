import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';
import { ApiPaginationQueries } from '../../../common/decorators/api/api-pagination.doc';

export function ApiFindAllPaymentsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Find all payments' }),
    ApiResponse({
      status: 200,
      description:
        'Paginated list of payments retrieved successfully. Returns { items, total }.',
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
