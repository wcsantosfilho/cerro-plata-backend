import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';

export function ApiGetOrganizationDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get an organization by ID' }),
    ApiResponse({
      status: 200,
      description: 'The organization has been successfully retrieved.',
    }),
    ApiResponse({ status: 400, description: 'Bad Request.' }),
    ApiCommonErrors(),
  );
}
