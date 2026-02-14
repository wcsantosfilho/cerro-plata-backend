import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationDto {
  @ApiProperty({
    required: false,
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  id: string;

  @ApiProperty({
    required: true,
    description: 'Organization name',
    example: 'CPM',
  })
  @IsNotEmpty()
  @IsString()
  organization_name: string;

  @IsDateString()
  @IsOptional()
  createdAt: Date;

  @IsDateString()
  @IsOptional()
  updatedAt: Date;
}
