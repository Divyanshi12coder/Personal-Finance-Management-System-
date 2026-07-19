import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 24999, description: 'Amount in minor units (e.g. paise for INR)' })
  @IsInt()
  @IsPositive()
  amountMinor: number;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: '2026-07-15' })
  @IsDateString()
  occurredOn: string;

  @ApiProperty({ required: false, example: 'Blue Tokai Coffee' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  merchant?: string;

  @ApiProperty({ required: false, example: 'Team lunch' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
