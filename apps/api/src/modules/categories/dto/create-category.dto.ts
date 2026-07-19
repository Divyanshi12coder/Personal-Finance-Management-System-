import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Pet Care' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 'paw-print', required: false })
  @IsOptional()
  @IsString()
  icon?: string;
}
