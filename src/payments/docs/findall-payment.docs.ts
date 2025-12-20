import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

export function ApiFindAllPaymentsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Find all payments' }),
    ApiResponse({
      status: 200,
      description:
        'Paginated list of payments retrieved successfully. Returns { items, total }.',
    }),
    ApiResponse({ status: 400, description: 'Bad Request.' }),
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
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number (1-based)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'NNumber of items per page',
      example: 10,
    }),
  );
}
