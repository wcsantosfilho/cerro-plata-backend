import {
  IsDateString,
  IsEnum,
  IsISO8601,
  IsObject,
  IsPhoneNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  MinLength,
  Min,
  ValidateNested,
  IsNumber,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToPhone } from '../../common/decorators/to-phone.decorator';
import { Type } from 'class-transformer';

export enum AssociateTypeEnum {
  FOUNDER = 'FOUNDER',
  REDEEMED = 'REDEEMED',
  BENEMERIT = 'BENEMERIT',
  HONORARY = 'HONORARY',
  SENIOR = 'SENIOR',
  CONTRIBUTING = 'CONTRIBUTING',
  COLABORATOR = 'COLABORATOR',
}

export enum AssociateCategoryEnum {
  INDIVIDUAL = 'INDIVIDUAL',
  FAMILY = 'FAMILY',
}

export enum PaymentPlanEnum {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMIANNUAL = 'SEMIANNUAL',
  ANNUAL = 'ANNUAL',
}

export enum BloodTypeEnum {
  O_POS = 'O_POS',
  O_NEG = 'O_NEG',
  A_POS = 'A_POS',
  A_NEG = 'A_NEG',
  B_POS = 'B_POS',
  B_NEG = 'B_NEG',
  AB_POS = 'AB_POS',
  AB_NEG = 'AB_NEG',
}

class AddressDto {
  @IsString()
  zipCode: string;

  @IsString()
  streetName: string;

  @IsString()
  streetNumber: string;

  @IsString()
  @IsOptional()
  addressComplement?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;
}

export class AssociateDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({
    required: false,
    description: 'Organization ID to which the associate belongs (tenant)',
    example: '0d33af20-ded0-4e7c-b6bf-8879d480adc0',
  })
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Association Record',
    example: '1014',
  })
  @IsString()
  @IsOptional()
  associationRecord: string;

  @ApiPropertyOptional({
    required: false,
    description: 'CPF',
    example: '12345678909',
  })
  @IsString()
  @IsOptional()
  @Length(11)
  @MaxLength(11)
  cpf: string;

  @ApiProperty({
    required: true,
    description: 'Name of the associate',
    example: 'Margie',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  name: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Phone number of the associate',
    example: '+5512988775544',
  })
  @IsString()
  @ToPhone()
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Emergency phone number',
    example: '+5512988775544',
  })
  @IsString()
  @ToPhone()
  @IsPhoneNumber()
  @IsOptional()
  emergencyPhoneNumber: string;

  @ApiPropertyOptional({
    required: false,
    description: 'email address of the associate',
    example: 'margie@example.com',
  })
  @IsString()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Address of the associate',
    example: {
      zipCode: '12345-678',
      streetName: 'Main St',
      streetNumber: '123',
      addressComplement: 'Apt 4B',
      city: 'Anytown',
      state: 'CA',
      country: 'USA',
    },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested() // habilita validação recursiva
  @Type(() => AddressDto) // converte JSON para instância de AddressDto
  address: AddressDto;

  @ApiProperty({
    required: true,
    description: 'Type of the associate',
    example: 'REDEEMED',
    enum: AssociateTypeEnum,
  })
  @IsEnum(AssociateTypeEnum)
  type: string;

  @ApiProperty({
    required: true,
    description: 'Category of association',
    example: 'INDIVIDUAL',
    enum: AssociateCategoryEnum,
  })
  @IsEnum(AssociateCategoryEnum)
  category: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Payment plan of the associate',
    example: 'MONTHLY',
    enum: PaymentPlanEnum,
  })
  @IsEnum(PaymentPlanEnum)
  paymentPlan: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Blood type of the associate',
    example: 'O_POS',
    enum: BloodTypeEnum,
  })
  @IsEnum(BloodTypeEnum)
  bloodType: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Associate birth date',
    example: '14/02/1985',
  })
  @IsISO8601()
  @IsOptional()
  birthDate: Date;

  @ApiPropertyOptional({
    required: false,
    description: 'Association Date',
    example: '14/02/1985',
  })
  @IsISO8601()
  @IsOptional()
  associationDate: Date;

  @ApiPropertyOptional({
    required: false,
    description: 'FEPAM Registration Number',
    example: 'FP11014',
  })
  @IsString()
  @IsOptional()
  fepamRegistrationNumber: string;

  @ApiPropertyOptional({
    required: false,
    description: 'FEPAM Association Due Date',
    example: '14/02/2025',
  })
  @IsISO8601()
  @IsOptional()
  fepamDueDate: Date;

  @IsDateString()
  @IsOptional()
  createdAt: Date;

  @IsDateString()
  @IsOptional()
  updatedAt: Date;
}

export class FindAllParameters {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  associationrecord?: string;

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

export class AssociateRouteParameters {
  @IsUUID()
  id: string;
}
