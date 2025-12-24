import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';

export function ApiCreateAssociateDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new associate',
    }),
    ApiResponse({
      status: 201,
      description: 'The associate has been successfully created.',
    }),
    ApiCommonErrors(),
  );
}
