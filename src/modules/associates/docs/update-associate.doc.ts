import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../../common/decorators/api/api-error.doc';

export function ApiUpdateAssociateDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update an existing associate',
    }),
    ApiResponse({
      status: 200,
      description: 'The associate has been successfully updated.',
    }),
    ApiCommonErrors(),
  );
}
