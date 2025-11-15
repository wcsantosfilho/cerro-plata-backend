import {
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

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

  @IsPhoneNumber()
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
  title: string;
  status: string;
}

export class TaskRouteParameters {
  @IsUUID()
  id: string;
}
