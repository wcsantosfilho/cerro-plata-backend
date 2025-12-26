import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';

export function ApiUpdateAssociateDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update an existing associate',
    }),
    ApiParam({
      name: 'id',
      description: 'ID do associado (UUID)',
      example: '123e4567-e89b-12d3-a456-426614174000',
      required: true,
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: 'The associate has been successfully updated.',
    }),
    ApiCommonErrors(),
  );
}
