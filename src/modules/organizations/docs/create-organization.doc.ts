import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';

export function ApiCreateOrganizationDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new organization' }),
    ApiResponse({
      status: 201,
      description: 'The organization has been really successfully created.',
    }),
    ApiResponse({ status: 400, description: 'Bad Request.' }),
    ApiCommonErrors(),
  );
}
