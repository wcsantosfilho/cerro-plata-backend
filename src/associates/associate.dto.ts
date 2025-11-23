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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToPhone } from '../common/decorators/to-phone.decorator';

export enum AssociateTypeEnum {
  REGULAR = 'REGULAR',
  FOUNDER = 'FOUNDER',
  REDEEMED = 'REDEEMED',
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
      city: 'Anytown',
      state: 'CA',
      country: 'USA',
    },
  })
  @IsOptional()
  @IsObject()
  address: {
    zipCode: string;
    streetName: string;
    streetNumber: string;
    city: string;
    state: string;
    country: string;
  };

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

export interface FindAllParameters {
  name: string;
  type: string;
  associationrecord: string;
}

export class AssociateRouteParameters {
  @IsUUID()
  id: string;
}
