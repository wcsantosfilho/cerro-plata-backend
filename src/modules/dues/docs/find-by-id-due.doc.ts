import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';

export function ApiFindByIdDueDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a due by ID' }),
    ApiParam({
      name: 'id',
      description: 'ID da obrigação (UUID)',
      example: '123e4567-e89b-12d3-a456-426614174000',
      required: true,
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: 'Due successfully retrieved.',
    }),
    ApiResponse({
      status: 404,
      description: 'Due not found.',
    }),
    ApiResponse({
      status: 400,
      description: 'Request parameters are invalid.',
    }),
    ApiCommonErrors(),
  );
}
