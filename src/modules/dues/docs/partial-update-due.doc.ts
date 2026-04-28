import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';

export function ApiPartialUpdateDueDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update, partially, an existing due',
    }),
    ApiParam({
      name: 'id',
      description: 'ID do devedor (UUID)',
      example: '123e4567-e89b-12d3-a456-426614174000',
      required: true,
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: 'The due has been successfully updated.',
    }),
    ApiCommonErrors(),
  );
}
