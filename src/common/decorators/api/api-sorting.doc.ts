import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiSortingQueries(availableFields: string[] = []) {
  const description = availableFields.length
    ? `Available fields to sorting: ${availableFields.join(', ')}`
    : 'field to sort.';

  return applyDecorators(
    ApiQuery({
      name: 'sortBy',
      required: false,
      description,
      example: availableFields[0] ?? 'createdAt',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      description: 'Direction of sorting (ASC or DESC)',
      enum: ['ASC', 'DESC'],
      example: 'ASC',
    }),
  );
}
