import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';

export function ApiGenerateDueDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Generate dues for associates' }),
    ApiResponse({
      status: 201,
      description: 'The dues have been generated successfully.',
    }),
    ApiResponse({ status: 400, description: 'Bad Request.' }),
    ApiCommonErrors(),
  );
}
