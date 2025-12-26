import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PaymentTypeEnum {
  COURSE = 'COURSE',
  MEMBERSHIP_FEE = 'MEMBERSHIP_FEE',
  SHOP = 'SHOP',
}

export class PaymentDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsOptional()
  associateId?: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Payment effective date',
    example: '2024-06-15T14:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  effectiveDate: string;

  @ApiProperty({
    required: true,
    description: 'Payment due date',
    example: '2024-06-15T14:30:00Z',
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    required: true,
    description: 'Description of the payment',
    example: 'Monthly membership fee',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  description: string;

  @ApiProperty({
    required: true,
    description: 'Amount paid',
    example: '100.00',
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    required: true,
    description: 'Type of payment',
    example: 'COURSE',
    enum: PaymentTypeEnum,
  })
  @IsEnum(PaymentTypeEnum)
  type: string;

  @IsDateString()
  @IsOptional()
  createdAt: Date;

  @IsDateString()
  @IsOptional()
  updatedAt: Date;
}

export class FindAllParameters {
  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsOptional()
  @IsString()
  type?: string;

  // Pagination
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(0)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(0)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Skip must be a number' })
  @Min(0)
  skip?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class PaymentRouteParameters {
  @IsUUID()
  id: string;
}

export class AssociateRouteParameters {
  @IsUUID()
  associateId: string;
}
