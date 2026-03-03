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
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PaymentTypeEnum {
  COURSE = 'COURSE',
  MEMBERSHIP_FEE = 'MEMBERSHIP_FEE',
  SHOP = 'SHOP',
}

export enum PaymentPlanEnum {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMIANNUAL = 'SEMIANNUAL',
  ANNUAL = 'ANNUAL',
}

export class DueDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({
    required: false,
    description: 'Associate ID to which the due belongs',
    example: '0d33af20-ded0-4e7c-b6bf-8879d480adc0',
  })
  @IsUUID()
  @IsOptional()
  associateId?: string;

  @ApiProperty({
    required: false,
    description: 'Organization ID to which the due belongs (tenant)',
    example: '0d33af20-ded0-4e7c-b6bf-8879d480adc0',
  })
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @ApiProperty({
    required: true,
    description: 'Due date',
    example: '2024-06-15T14:30:00Z',
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    required: true,
    description: 'Description of the due',
    example: 'Monthly membership fee',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  description: string;

  @ApiProperty({
    required: true,
    description: 'Amount due',
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

  @ApiProperty({
    required: true,
    description: 'Payment plan of the associate',
    example: 'MONTHLY',
    enum: PaymentPlanEnum,
  })
  @IsEnum(PaymentPlanEnum)
  paymentPlan: string;

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

export class DueRouteParameters {
  @IsUUID()
  id: string;
}
