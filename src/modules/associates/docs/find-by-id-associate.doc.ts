import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';

export function ApiFindByIdAssociateDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get an associate by ID' }),
    ApiParam({
      name: 'id',
      description: 'ID do associado (UUID)',
      example: '123e4567-e89b-12d3-a456-426614174000',
      required: true,
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: 'Associate successfully retrieved.',
    }),
    ApiResponse({
      status: 404,
      description: 'Associate not found.',
    }),
    ApiResponse({
      status: 400,
      description: 'Request parameters are invalid.',
    }),
    ApiCommonErrors(),
  );
}
