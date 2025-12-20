import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiCreatePaymentDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new payment' }),
    ApiResponse({
      status: 201,
      description: 'The payment has been really successfully created.',
    }),
    ApiResponse({ status: 400, description: 'Bad Request.' }),
  );
}
