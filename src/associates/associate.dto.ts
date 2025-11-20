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

  @IsString()
  associationRecord: string;

  @IsString()
  @MinLength(3)
  @MaxLength(256)
  name: string;

  @IsString()
  @IsPhoneNumber()
  @ToPhone()
  phoneNumber: string;

  @IsObject()
  address: {
    zipCode: string;
    streetName: string;
    streetNumber: string;
    city: string;
    state: string;
    country: string;
  };

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
}

export class AssociateRouteParameters {
  @IsUUID()
  id: string;
}
