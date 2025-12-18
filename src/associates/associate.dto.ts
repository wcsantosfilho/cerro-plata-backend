import {
  IsDateString,
  IsEnum,
  IsObject,
  IsPhoneNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  Min,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToPhone } from '../common/decorators/to-phone.decorator';
import { Type } from 'class-transformer';

export enum AssociateTypeEnum {
  REGULAR = 'REGULAR',
  FOUNDER = 'FOUNDER',
  REDEEMED = 'REDEEMED',
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
    required: true,
    description: 'Association Record',
    example: '1014',
  })
  @IsString()
  associationRecord: string;

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
  @IsPhoneNumber()
  @ToPhone()
  @IsOptional()
  phoneNumber: string;

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
    example: 'REGULAR',
    enum: AssociateTypeEnum,
  })
  @IsEnum(AssociateTypeEnum)
  type: string;

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
}

export class AssociateRouteParameters {
  @IsUUID()
  id: string;
}
