import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';

export function ApiFindByIdOrganizationDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get an organization by ID' }),
    ApiParam({
      name: 'id',
      description: 'ID da organização (UUID)',
      example: '123e4567-e89b-12d3-a456-42661412432a',
      required: true,
      type: String,
    }),

    ApiResponse({
      status: 200,
      description: 'The organization has been successfully retrieved.',
    }),
    ApiResponse({ status: 400, description: 'Bad Request.' }),
    ApiCommonErrors(),
  );
}
