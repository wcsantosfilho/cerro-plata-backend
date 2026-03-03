import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';

export function ApiCreateDueDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new due' }),
    ApiResponse({
      status: 201,
      description: 'The due has been created successfully.',
    }),
    ApiResponse({ status: 400, description: 'Bad Request.' }),
    ApiCommonErrors(),
  );
}
