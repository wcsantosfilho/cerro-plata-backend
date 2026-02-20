import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    required: false,
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  id: string;

  @ApiProperty({ required: true, description: 'Username', example: 'john_doe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    required: true,
    description: 'User email',
    example: 'john_doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true,
    description: 'User password',
    example: 'strongPassword123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    required: false,
    description: 'Organization ID to which the user is authorized to (tenant)',
    example: '0d33af20-ded0-4e7c-b6bf-8879d480adc0',
  })
  @IsUUID()
  organizationId?: string | null;
}
